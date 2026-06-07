import { GOOGLE_SAFE_RULES, QUALITY_SEO_RULES, AEO_RULES } from "./google-safe-prompt";
import {
  resolveStudyTopic,
  resolveStudyTopicForType,
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

const MOCK_TEST_JSON_HELP = `
MOCK_TEST_JSON (inside a single \`\`\`mock-test code fence in "content"):
{
  "title": "Hindi mock test title",
  "durationMinutes": 30,
  "questions": [
    { "id": "1", "type": "mcq", "text": "प्रश्न?", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "Hindi" },
    { "id": "2", "type": "tf", "text": "कथन", "correct": true, "explanation": "Hindi" },
    { "id": "3", "type": "short", "text": "रिक्त स्थान भरें", "acceptableAnswers": ["उत्तर"], "explanation": "Hindi" }
  ]
}
Question types: mcq (options + correctIndex 0-3), tf (correct true/false), short (acceptableAnswers array).
All question text and explanations in Hindi Devanagari.`;

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
  compact: boolean
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

  if (materialType === "mock-test") {
    const q = compact ? 10 : 15;
    return `
CONTENT STRUCTURE (interactive online mock test):${AEO_HEADING}

## 📝 मॉक टेस्ट परिचय
2-3 paragraphs: exam, syllabus, how to use this interactive mock on StudyMitra.

## 🎯 कैसे करें
4-6 bullets — time limit, attempt all questions, then click "Score Check".

## 🧪 इंटरैक्टिव मॉक टेस्ट (REQUIRED — WILL BE REJECTED WITHOUT THIS)
You MUST include exactly ONE fenced block starting with the line \`\`\`mock-test (three backticks + mock-test).
Then valid JSON on following lines, then closing \`\`\` on its own line.
${q} questions inside JSON — NOT as plain markdown MCQ list.
Do NOT use \`\`\`json — use \`\`\`mock-test only.
Do NOT paste answers in markdown outside the fence.
${MOCK_TEST_JSON_HELP}
Mix: ~70% mcq, ~20% tf, ~10% short.

## 📊 स्कोर के बाद
Revision tips for weak areas — 2 paragraphs.${FAQ_HEADING}

## निष्कर्ष
2 lines.`;
  }

  if (materialType === "questions") {
    const q = compact ? 8 : 10;
    return `
CONTENT STRUCTURE (practice questions + interactive quiz):${AEO_HEADING}

## 🎯 किस परीक्षा के लिए?
Exam + difficulty level.

## 📌 पेपर पैटर्न
4-6 bullets.

## 🧪 ऑनलाइन प्रैक्टिस क्विज़ (REQUIRED — REJECTED WITHOUT \`\`\`mock-test FENCE)
ONE \`\`\`mock-test fenced JSON block with ${q} questions (mcq + at least 1 tf).
Fence format: line 1 = \`\`\`mock-test , then JSON, then closing \`\`\`.
Users answer on page and check score — no answer key in plain markdown.
${MOCK_TEST_JSON_HELP}

## 📖 सामान्य गलतियाँ
2 paragraphs.${FAQ_HEADING}

## निष्कर्ष
Daily practice reminder.`;
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

export function buildPrompt(
  compact = false,
  slot: PostSlot = 0,
  materialType?: StudyMaterialType
): string {
  const topic = materialType
    ? resolveStudyTopicForType(materialType, slot)
    : resolveStudyTopic(slot);
  const { year, month } = getCurrentYearMonth();
  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const typeLabel = MATERIAL_TYPE_LABELS[topic.materialType];

  const titleExamples: Record<StudyMaterialType, string> = {
    notes: '"SSC CGL 2026 Notes Hindi" / "NEET Biology Short Notes"',
    questions: '"50 SSC Math MCQ Online Practice Hindi"',
    "mock-test": '"RRB NTPC Online Mock Test Hindi 2026"',
    vacancy: '"SSC CGL 2026 Vacancy Details Hindi"',
  };

  const seoHint =
    topic.materialType === "mock-test" || topic.materialType === "questions"
      ? 'seo_title MUST include "Online Mock Test" + exam name + Hindi + 2026. seo_description MUST include "interactive", "score check", "MCQ".'
      : topic.materialType === "notes"
        ? 'seo_title include exam name + "Notes Hindi" + 2026.'
        : 'seo_title include exam + "Vacancy" + Hindi + 2026.';

  const mockFenceRule =
    topic.materialType === "mock-test" || topic.materialType === "questions"
      ? `
CRITICAL (auto-publish rejects without this):
- "content" MUST contain a \`\`\`mock-test fenced JSON block with questions array.
- Never output plain-text numbered MCQs with answers in markdown.
- Never use \`\`\`json for the quiz — only \`\`\`mock-test.`
      : "";

  return `You are a Hindi study-material writer for StudyMitra.
ONLY: notes, practice questions, mock tests, vacancy guides. NO news, NO lifestyle viral posts.
${mockFenceRule}

Today: ${month} ${year}. Slot: ${slot === 0 ? "notes or mock test" : "questions or vacancy"}.
Return ONLY valid JSON: title, slug, excerpt, seo_title, seo_description, content, faq (6-8 {question, answer} in Hindi).

TITLE: Under 70 chars | Examples: ${titleExamples[topic.materialType]}
Reader benefit: ${topic.viralAngle}
Type: ${typeLabel}
${seoHint}

TOPIC: ${topic.category}
Focus: ${topic.hint}
Keywords (natural 2-4x): ${topic.keywords}

RULES: Hindi (Devanagari) | Min ${minWords} words in markdown (excluding JSON fence) | No fake vacancies/dates

${GOOGLE_SAFE_RULES}
${QUALITY_SEO_RULES}
${AEO_RULES}

${buildContentStructure(topic.materialType, compact)}

SLUG: English, lowercase, hyphens, exam + type (e.g. railway-mock-test-hindi-2026).
Return COMPLETE JSON only — never truncate the mock-test JSON block.`;
}
