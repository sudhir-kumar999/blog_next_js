import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv(f: string) {
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
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
loadEnv(path.join(root, ".env.local"));

async function main() {
  const { supabaseServer } = await import("../lib/supabase/server");
  const { renderMarkdownContent } = await import("../lib/markdown/renderContent");

  const { data } = await supabaseServer
    .from("posts")
    .select("content")
    .eq("slug", "rrb-ntpc-interactive-mock-test-hindi-demo")
    .single();

  const c = data?.content ?? "";
  console.log("has ```mock-test:", c.includes("```mock-test"));
  const idx = c.indexOf("mock-test");
  console.log("snippet:", JSON.stringify(c.slice(Math.max(0, idx - 30), idx + 100)));

  const segs = renderMarkdownContent(c);
  console.log(
    "segments:",
    segs.map((s) => (s.type === "mock-test" ? `mock-test(${s.data.questions.length}q)` : "html"))
  );
}

main();
