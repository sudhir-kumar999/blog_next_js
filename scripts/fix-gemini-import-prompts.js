const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "lib", "gemini.ts");
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const start = lines.findIndex((l) => l.startsWith("function getCurrentYearMonth"));
const end = lines.findIndex((l) => l.startsWith("function extractFinishReason("));
if (start < 0 || end < 0) throw new Error("markers not found");

const head = lines.slice(0, start);
const tail = lines.slice(end);

let g = [
  ...head.filter((l) => !l.includes("google-safe-prompt")),
  'import { enrichPostForSeo, validatePostQuality, type PostQualityFailure } from "./post-quality";',
  'import { countWords } from "./wordCount";',
  'import { buildContentStructure, buildPrompt } from "./gemini-prompts";',
  "",
  ...tail,
].join("\n");

g = g.replace(/  parsePostSlot,\n/, "");
g = g.replace(
  "if (result.ok) return { ...result, slot };",
  `if (result.ok) {
      const materialType = resolveStudyTopic(slot).materialType;
      return { ...result, slot, materialType };
    }`
);
g = g.replace(
  "| { ok: true; post: GeneratedPost; slot: PostSlot }",
  '| { ok: true; post: GeneratedPost; slot: PostSlot; materialType: import("./study-material").StudyMaterialType }'
);
if (!g.includes("missing_aeo")) {
  g = g.replace(
    'case "invalid_title":',
    'case "missing_aeo":\n      return f.reason;\n    case "invalid_title":'
  );
}
g = g.replace("contents: await buildPrompt", "contents: buildPrompt");

fs.writeFileSync(p, g);
console.log("fixed", g.split(/\n/).length, "lines");
