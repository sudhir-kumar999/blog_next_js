const fs = require("fs");
const p = require("path").join(__dirname, "..", "lib", "gemini.ts");
let t = fs.readFileSync(p, "utf8");
t = t.replace(
  /import \{ GOOGLE_SAFE_RULES, VIRAL_SEO_RULES \}/,
  "import { GOOGLE_SAFE_RULES, QUALITY_SEO_RULES }"
);
t = t.replace(/\$\{VIRAL_SEO_RULES\}/g, "${QUALITY_SEO_RULES}");
t = t.replace(/Viral angle:/g, "Reader benefit:");
t = t.replace(/WhatsApp[^\n]*/g, "Study Mitra blog.");
t = t.replace("contents: await buildPrompt", "contents: buildPrompt");
fs.writeFileSync(p, t);
console.log("ok", t.split(/\n/).length, "lines");
