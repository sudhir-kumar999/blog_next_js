/**
 * One-off: generate & publish a mock-test post via Gemini (for UI testing).
 * Usage: npx tsx scripts/generate-mock-test-post.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));
process.env.GEMINI_COMPACT = process.env.GEMINI_COMPACT ?? "true";

async function main() {
  const { generateBlogPost } = await import("../lib/gemini");
  const { getCategoryIdForMaterialType } = await import("../lib/category-for-material");
  const { extractMockTestsFromMarkdown } = await import("../lib/mock-test/parse");
  const { supabaseServer } = await import("../lib/supabase/server");

  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.error("GEMINI_API_KEY missing in .env.local");
    process.exit(1);
  }

  console.log("Generating mock-test post via Gemini (compact mode)...");
  const res = await generateBlogPost({ slot: 0, materialType: "mock-test" });

  if (!res.ok) {
    console.error("Generation failed:", JSON.stringify(res.failure, null, 2));
    process.exit(1);
  }

  const generated = res.post;
  const mockTests = extractMockTestsFromMarkdown(generated.content);
  if (mockTests.length === 0) {
    console.error("Post generated but no ```mock-test block found — aborting publish.");
    process.exit(1);
  }

  console.log(
    `Parsed interactive quiz: "${mockTests[0].title}" (${mockTests[0].questions.length} questions)`
  );

  let slug = generated.slug;
  const { data: existing } = await supabaseServer
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${generated.slug}-test-${Date.now().toString(36)}`;
  }

  const categoryId = await getCategoryIdForMaterialType("mock-test");

  const { error: insertError } = await supabaseServer.from("posts").insert({
    title: generated.title,
    slug,
    excerpt: generated.excerpt,
    content: generated.content,
    seo_title: generated.seo_title,
    seo_description: generated.seo_description,
    featured_image: null,
    category_id: categoryId,
    published: true,
    published_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Supabase insert failed:", insertError.message);
    process.exit(1);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  console.log("\nMock test post published!");
  console.log("Title:", generated.title);
  console.log("Slug:", slug);
  console.log("URL:", `${siteUrl}/blog/${slug}`);
  console.log("Local:", `http://localhost:3000/blog/${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
