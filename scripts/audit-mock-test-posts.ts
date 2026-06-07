/**
 * Audit all posts for interactive mock-test blocks.
 * Usage: npx tsx scripts/audit-mock-test-posts.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvFile(path.join(root, ".env.local"));

async function main() {
  const { supabaseServer } = await import("../lib/supabase/server");
  const { extractMockTestsFromMarkdown } = await import("../lib/mock-test/parse");
  const { renderMarkdownContent } = await import("../lib/markdown/renderContent");

  const { data: posts } = await supabaseServer
    .from("posts")
    .select("id, title, slug, content, categories(name, slug)")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (!posts?.length) {
    console.log("No published posts.");
    return;
  }

  const mockKeywords = /mock|मॉक|quiz|mcq|practice test|online test/i;
  let ok = 0;
  let missing = 0;
  let partial = 0;

  console.log("=== Mock test audit ===\n");

  for (const post of posts) {
    const cat = Array.isArray(post.categories) ? post.categories[0] : post.categories;
    const catSlug = cat?.slug ?? "";
    const likelyMock =
      catSlug === "mock-tests" ||
      catSlug === "practice-questions" ||
      mockKeywords.test(post.title) ||
      mockKeywords.test(post.content?.slice(0, 500) ?? "");

    if (!likelyMock) continue;

    const tests = extractMockTestsFromMarkdown(post.content ?? "");
    const segments = renderMarkdownContent(post.content ?? "");
    const hasQuizSegment = segments.some((s) => s.type === "mock-test");
    const fence = (post.content ?? "").includes("```mock-test");

    if (tests.length > 0 && hasQuizSegment) {
      ok++;
      console.log(`OK  | ${tests[0].questions.length}q | ${post.slug}`);
    } else if (tests.length > 0) {
      partial++;
      console.log(`WARN| parsed but no segment | ${post.slug}`);
    } else {
      missing++;
      console.log(`FAIL| no \`\`\`mock-test block | ${post.slug}`);
      console.log(`     title: ${post.title}`);
    }
  }

  console.log(`\nSummary: ${ok} OK, ${partial} partial, ${missing} missing interactive quiz`);
  if (missing > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
