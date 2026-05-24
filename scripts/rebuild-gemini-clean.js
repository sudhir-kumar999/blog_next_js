/**
 * Restores lib/gemini.ts to study-only + AEO when the file gets corrupted by editor merges.
 * Run: node scripts/rebuild-gemini-clean.js
 */
const fs = require("fs");
const path = require("path");

const geminiPath = path.join(__dirname, "..", "lib", "gemini.ts");
let t = fs.readFileSync(geminiPath, "utf8");
const lines = t.split(/\r?\n/);

if (lines.length > 750 || t.includes("GENERAL_VIRAL_TOPICS") || t.includes("resolveNewsTopic")) {
  const cut = lines.findIndex((l) => l.startsWith("function buildContentStructure("));
  const tailStart = lines.findIndex((l) => l.startsWith("function extractFinishReason("));
  if (cut > 0 && tailStart > cut) {
    const headEnd = lines.findIndex((l) => l.includes("const MATERIAL_TYPE_LABELS"));
    let head = lines.slice(0, headEnd >= 0 ? headEnd : 178);
    head = head.filter(
      (l) =>
        !l.includes("__REMOVE_START") &&
        !l.includes("TRENDING_STUDY") &&
        !l.startsWith("type ResolvedTopic") &&
        !l.includes("fetchIndiaNewsHeadlines")
    );
    while (head.length && head[head.length - 1].trim() === "") head.pop();
    t = head.join("\n") + "\n\n" + lines.slice(cut, tailStart).join("\n") + "\n\n" + lines.slice(tailStart).join("\n");
    fs.writeFileSync(geminiPath, t);
    console.log("trimmed corrupt middle");
  }
}

require("./patch-gemini-aeo.js");

let g = fs.readFileSync(geminiPath, "utf8");
g = g.replace(
  /export \{ parsePostSlot \} from "\.\/study-material";\n/,
  ""
);
g = g.replace(
  /import \{\n  parsePostSlot,\n  resolveStudyTopic,/,
  "import {\n  resolveStudyTopic,"
);
if (!g.includes('export type { PostSlot }')) {
  g = g.replace(
    /from "\.\/study-material";/,
    'from "./study-material";\n\nexport type { PostSlot } from "./study-material";\nexport { parsePostSlot } from "./study-material";'
  );
}
const genReturn = g.match(/export async function generateBlogPost[\s\S]*?return \{ \.\.\.result, slot \}/);
if (genReturn && !genReturn[0].includes("materialType")) {
  g = g.replace(
    "if (result.ok) return { ...result, slot };",
    `if (result.ok) {
      const materialType = resolveStudyTopic(slot).materialType;
      return { ...result, slot, materialType };
    }`
  );
}
g = g.replace(
  /\| \{ ok: true; post: GeneratedPost; slot: PostSlot \}/,
  "| { ok: true; post: GeneratedPost; slot: PostSlot; materialType: import(\"./study-material\").StudyMaterialType }"
);
if (!g.includes('case "missing_aeo"')) {
  g = g.replace(
    'case "invalid_title":\n      return "Invalid or missing title";',
    'case "invalid_title":\n      return "Invalid or missing title";\n    case "missing_aeo":\n      return f.reason;'
  );
}
fs.writeFileSync(geminiPath, g);
console.log("rebuild done", g.split(/\n/).length, "lines");
