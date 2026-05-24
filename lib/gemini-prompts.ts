import { GOOGLE_SAFE_RULES, QUALITY_SEO_RULES, AEO_RULES } from "./google-safe-prompt";
import {
  resolveStudyTopic,
  type PostSlot,
  type StudyMaterialType,
} from "./study-material";
import { MIN_POST_WORDS } from "./wordCount";

const MATERIAL_TYPE_LABELS: Record<StudyMaterialType, string> = {
  notes: "STUDY NOTES",
  questions: "PRACTICE QUESTIONS",
  "mock-test": "MOCK TEST",
  vacancy: "VACANCY DETAILS",
};

const AEO_HEADING = `
## सीधा जवाब
45-70 words — seedha jawab jo Google / AI overview mein kaam aaye.`;

const FAQ_HEADING = `
## 💬 लोग ये भी पूछते हैं (FAQ)
Minimum 6 pairs — **प्रश्न:** ... **उत्तर:** ... (2-4 sentences each).`;

function getCurrentYearMonth(): { year: number; month: string } {
  const today = new Date();
  const year = today.getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return { year, month: months[today.getMonth()] ?? "May" };
}

export function buildContentStructure(
  materialType: StudyMaterialType,
  mcqCount: number,
  factCount: number
): string {
  if (materialType === "notes") {
    return `
CONTENT STRUCTURE (study notes — use these ## headings):${AEO_HEADING}

## 📚 ये नोट्स किसके लिए हैं?
Exam name + level (SSC/NEET/UPSC/Railway/Board).

## 📌 एक नज़र में (Quick Revision)
8-10 high-yield bullets.

## 📖 विषयवार नोट्स
Chapter/topic wise: definitions, formulas, dates, tables.

## ⚡ याद रखने की ट्रिक्स
Memory hooks and exam traps.${FAQ_HEADING}

## निष्कर्ष
2 lines — revision reminder.`;
  }

  if (materialType === "questions") {
    return `
CONTENT STRUCTURE (practice questions):${AEO_HEADING}

## 🎯 किस परीक्षा के लिए?
Clear exam label.

## 📌 पेपर पैटर्न
4-6 bullets.

## ❓ ${mcqCount} प्रश्न (उत्तर + व्याख्या)
**Q1.** (A)(B)(C)(D) ✅ **उत्तर: (X)** 💡 **व्याख्या:**${FAQ_HEADING}

## निष्कर्ष
Daily practice — 2 lines.`;
  }

  if (materialType === "mock-test") {
    const q = Math.min(mcqCount, 50);
    return `
CONTENT STRUCTURE (mock test):${AEO_HEADING}

## 📝 मॉक टेस्ट विवरण
Questions, time, marking.

## 📋 प्रश्न पत्र (${q} MCQ)
**Q1.** (A)(B)(C)(D)

## ✅ उत्तर कुंजी + समाधान
Full answers.${FAQ_HEADING}

## निष्कर्ष
2 lines.`;
  }

  return `
CONTENT STRUCTURE (vacancy guide):${AEO_HEADING}

## 📢 भर्ती संक्षिप्त विवरण
Factual only.

## 📌 मुख्य तिथियाँ
Table — official site check karein if unsure.

## ✅ पात्रता
Bullets.

## 📝 चयन प्रक्रिया
Stages.${FAQ_HEADING}

## निष्कर्ष
2 lines.`;
}

export function buildPrompt(compact = false, slot: PostSlot = 0): string {
  const topic = resolveStudyTopic(slot);
  const { year, month } = getCurrentYearMonth();
  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const mcqCount = compact ? 10 : 12;
  const factCount = compact ? 8 : 10;
  const typeLabel = MATERIAL_TYPE_LABELS[topic.materialType];

  const titleExamples: Record<StudyMaterialType, string> = {
    notes: '"SSC CGL 2026 Notes Hindi" / "NEET Biology Short Notes"',
    questions: '"50 SSC Math MCQ with Answers"',
    "mock-test": '"RRB NTPC Full Mock Test Hindi"',
    vacancy: '"SSC CGL 2026 Vacancy Details Hindi"',
  };

  return `You are a Hindi study-material writer for StudyMitra.
ONLY: notes, practice questions, mock tests, vacancy guides. NO news, NO lifestyle viral posts.

Today: ${month} ${year}. Slot: ${slot === 0 ? "notes or mock test" : "questions or vacancy"}.
Return ONLY valid JSON: title, slug, excerpt, seo_title, seo_description, content, faq (6-8 {question, answer} in Hindi).

TITLE: Under 70 chars | Examples: ${titleExamples[topic.materialType]}
Reader benefit: ${topic.viralAngle}
Type: ${typeLabel}

TOPIC: ${topic.category}
Focus: ${topic.hint}
Keywords (natural 2-4x): ${topic.keywords}

RULES: Hindi (Devanagari) | Min ${minWords} words | No fake vacancies/dates

${GOOGLE_SAFE_RULES}
${QUALITY_SEO_RULES}
${AEO_RULES}

${buildContentStructure(topic.materialType, mcqCount, factCount)}

SLUG: English, lowercase, hyphens, exam + type (e.g. ssc-cgl-notes-hindi-2026).
Return COMPLETE JSON only.`;
}
