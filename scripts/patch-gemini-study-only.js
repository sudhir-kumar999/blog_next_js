const fs = require("fs");
const path = require("path");

const geminiPath = path.join(__dirname, "..", "lib", "gemini.ts");
let src = fs.readFileSync(geminiPath, "utf8");

const buildContentStructure = `function buildContentStructure(
  materialType: StudyMaterialType,
  mcqCount: number,
  factCount: number
): string {
  if (materialType === "notes") {
    return \`
CONTENT STRUCTURE (study notes — use these ## headings):

## 📚 ये नोट्स किसके लिए हैं?
Exam name + level (SSC/NEET/UPSC/Railway/Board).

## 📌 एक नज़र में (Quick Revision)
8-10 high-yield bullets — save karne layak.

## 📖 विषयवार नोट्स
Chapter/topic wise: definition, formula, dates, tables.

## ⚡ याद रखने की ट्रिक्स
Memory hooks, mnemonics, common traps.

## 🎯 \${factCount} महत्वपूर्ण पॉइंट्स
Numbered 1-\${factCount} — exam-focused only.

## 💬 FAQ
4-5 short Q&A.

## 📲 दोस्तों के साथ शेयर करें
Study group CTA + Study Mitra.

## निष्कर्ष
2 lines — revision reminder.\`;
  }

  if (materialType === "questions") {
    return \`
CONTENT STRUCTURE (practice questions — use these ## headings):

## 🎯 आज के प्रश्न किस परीक्षा के लिए?
SSC/Railway/UPSC/Bank/Teacher — clear label.

## 📌 पेपर पैटर्न (संक्षेप)
Sections, marks, time — 4-6 bullets.

## ❓ \${mcqCount} प्रश्न (उत्तर + व्याख्या)
**Q1.** (A)(B)(C)(D) ✅ **उत्तर: (X)** 💡 **व्याख्या:**

## ⚡ शॉर्ट ट्रिक्स
2-4 tricks from today's questions.

## ⚠️ सामान्य गलतियां
3 mistakes students make.

## 💬 FAQ
4-5 doubts.

## 📲 शेयर करें
WhatsApp CTA + Study Mitra.

## निष्कर्ष
Daily practice habit — 2 lines.\`;
  }

  if (materialType === "mock-test") {
    const q = Math.min(mcqCount, 50);
    return \`
CONTENT STRUCTURE (full mock test — use these ## headings):

## 📝 मॉक टेस्ट विवरण
Exam name, total questions, suggested time, negative marking if any.

## ⏱️ परीक्षा से पहले निर्देश
3-5 rules — timer, OMR style, honesty.

## 📋 प्रश्न पत्र (\${q} MCQ)
Number Q1-Q\${q}. Format: **Q1.** (A)(B)(C)(D)

## ✅ उत्तर कुंजी + विस्तृत समाधान
After all questions — answers with Hindi explanation per tricky Q.

## 📊 स्कोर विश्लेषण गाइड
How to check score, weak topics, next mock when.

## 💬 FAQ
4-5 Q&A.

## 📲 शेयर करें
Study Mitra mock series CTA.

## निष्कर्ष
2 lines — mock = real exam practice.\`;
  }

  return \`
CONTENT STRUCTURE (vacancy / recruitment details — use these ## headings):

## 📢 भर्ती का संक्षिप्त विवरण
Post name, recruiting body — factual only.

## 📌 मुख्य तिथियाँ (Table)
Apply start/end, exam date if known — say "official site check karein" if unsure.

## ✅ पात्रता
Age, education, nationality — bullet list.

## 💰 पद / वेतन (सार्वजनिक स्रोतों के अनुसार)
Approx range — no fake guarantees.

## 📝 चयन प्रक्रिया
Stages: written, physical, interview etc.

## 📚 तैयारी कैसे शुरू करें
Link topics to notes/questions on Study Mitra.

## ⚠️ सावधानी
Only official websites for apply — scam alert.

## 💬 FAQ
4-5 real student doubts.

## 📲 शेयर करें
Friends ko bhejein + Study Mitra.

## निष्कर्ष
2 lines — apply carefully, prepare parallel.\`;
}`;

const buildPrompt = `function buildPrompt(compact = false, slot: PostSlot = 0): string {
  const topic = resolveStudyTopic(slot);
  const { year, month } = getCurrentYearMonth();
  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const mcqCount = compact ? 10 : 12;
  const factCount = compact ? 8 : 10;
  const typeLabel = MATERIAL_TYPE_LABELS[topic.materialType];

  const titleExamples: Record<StudyMaterialType, string> = {
    notes: '"SSC CGL 2026 Notes Hindi" / "NEET Biology Short Notes"',
    questions: '"50 SSC Math MCQ with Answers" / "Current Affairs Practice Questions"',
    "mock-test": '"RRB NTPC Full Mock Test Hindi" / "UPSC Prelims Mini Mock 50 Questions"',
    vacancy: '"SSC CGL 2026 Vacancy Details Hindi" / "Railway Bharti Notification Guide"',
  };

  return \`You are a Hindi study-material writer for StudyMitra — Sarkari Result + Unacademy style.
ONLY study content: notes, practice questions, mock tests, or government exam vacancy details.
NO breaking news, NO lifestyle/viral/general entertainment, NO petrol/gold/weather news articles.

Today: \${month} \${year}. Post slot: \${slot === 0 ? "study notes or mock test" : "practice questions or vacancy"}.
Return ONLY valid JSON: title, slug, excerpt, seo_title, seo_description, content.

TITLE: Under 70 chars | Examples: \${titleExamples[topic.materialType]}
Viral angle: \${topic.viralAngle}
Content type: \${typeLabel}

TOPIC: \${topic.category}
Focus: \${topic.hint}
Keywords (6-10x naturally): \${topic.keywords}

RULES: Hindi (Devanagari) | Min \${minWords} words | Exam-useful | No fake vacancies or fake dates
Vacancy posts: say "official notification check karein" when dates uncertain.

\${GOOGLE_SAFE_RULES}
\${VIRAL_SEO_RULES}

\${buildContentStructure(topic.materialType, mcqCount, factCount)}

SLUG: English, lowercase, hyphens, include exam + material type (e.g. ssc-cgl-notes-hindi-2026, railway-mock-test-hindi).
Return COMPLETE JSON only — never truncate.\`;
}`;

const start = src.indexOf("function buildContentStructure(");
const end = src.indexOf("function extractFinishReason(");
if (start < 0 || end < 0) {
  console.error("markers not found", { start, end });
  process.exit(1);
}

src = src.slice(0, start) + buildContentStructure + "\n\n" + buildPrompt + "\n\n" + src.slice(end);

const genStart = src.indexOf("export async function generateBlogPost(");
const genEnd = src.indexOf("  return { ok: false, failure: lastFailure", genStart);
const oldReturn = `    const result = await attemptGenerate(apiKey, compact, slot);
    if (result.ok) return { ...result, slot };`;
const newReturn = `    const result = await attemptGenerate(apiKey, compact, slot);
    if (result.ok) {
      const materialType = resolveStudyTopic(slot).materialType;
      return { ...result, slot, materialType };
    }`;
if (src.includes(oldReturn)) {
  src = src.replace(oldReturn, newReturn);
}

const typeExport = src.indexOf("export async function generateBlogPost");
const typeLine =
  "  | { ok: true; post: GeneratedPost; slot: PostSlot; materialType: StudyMaterialType }";
src = src.replace(
  "  | { ok: true; post: GeneratedPost; slot: PostSlot }",
  typeLine
);

fs.writeFileSync(geminiPath, src);
console.log("patched", geminiPath);
