import { GOOGLE_SAFE_RULES } from "./google-safe-prompt";
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

const PERSONAS = [
  `Tone: एक अनुभवी टीचर जो सरल Hindi में समझाता है। छोटे-छोटे उदाहरण देता है, बीच-बीच में "जैसे" और "मान लीजिए" का उपयोग करता है।`,
  `Tone: एक टॉपर छात्र जो अपने फ्रेंड को पढ़ा रहा है — casual, friendly, "यार ये मैंने ऐसे किया" style। रट्टा लगाने के बजाय logic समझाता है।`,
  `Tone: एक मेंटर/बड़ा भाई जो बता रहा है "मैंने अपने समय में ये गलती की थी, तुम मत करना"। Personal experience share करता है।`,
  `Tone: Direct, no-nonsense, exam-focused। जो बेकार है वो नहीं लिखता, सिर्फ वही बताता है जो exam में आएगा। Tables और points में जानकारी देता है।`,
];

const PERSONA_SEED = /* seeded below in buildPrompt */ "";

function getPersona(): string {
  const index = Math.floor(Math.random() * PERSONAS.length);
  return PERSONAS[index];
}

function getCurrentYearMonth(): { year: number; month: string } {
  const today = new Date();
  const year = today.getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return { year, month: months[today.getMonth()] ?? "May" };
}

export function buildContentGuidelines(
  materialType: StudyMaterialType,
  compact: boolean
): string {
  const isMockOrQuiz = materialType === "mock-test" || materialType === "questions";
  const q = materialType === "mock-test" ? (compact ? 10 : 15) : (compact ? 8 : 10);

  const mockBlockReq = isMockOrQuiz
    ? `- "content" mein EK \`\`\`mock-test fenced JSON block HOGA jisme ${q} questions hain (mcq + tf mix). Yeh block REQUIRED hai. JSON ke format ke liye neeche diya gaya hai.
- MCQ ke answers kabhi bhi plain markdown mein mat likho — sirf \`\`\`mock-test fence ke andar JSON mein.
${MOCK_TEST_JSON_HELP}`
    : "";

  return `CONTENT KE LIYE MOCK STRUCTURE (exact headings nahi, bas idea ke liye hai — aap apne hisaab se headings choose karo):

Post ka type: ${MATERIAL_TYPE_LABELS[materialType]}

{${
  materialType === "notes"
    ? `
Post ko NATURAL Hindi mein likho. Ek real teacher ya topper ki tarah jo apne dosto ko padha raha ho.
Koi fixed heading structure nahi hai — lekin aam taur par ye sections aa sakte hain (order change kar sakte ho):
- एकदम शुरू में 2-4 sentences का direct answer (heading "सीधा जवाब" या "Quick Answer" ya "एक नज़र में" ke saath) — taaki reader ko turant idea mil jaye
- ये नोट्स किनके लिए हैं (exam ya subject specify karo)
- विषय के मुख्य पॉइंट्स / फॉर्मूले / तथ्य
- छोटी-छोटी टेबल या बुलेट पॉइंट्स जहाँ ज़रूरत हो
- आम गलतियाँ और उनसे कैसे बचें
- कुछ प्रश्न और उनके जवाब (FAQ style) — हर प्रश्न **प्रश्न:** और **उत्तर:** format mein
- अंत में 2-3 lines का summary या revision reminder`
    : materialType === "vacancy"
      ? `
Post को एक जानकार दोस्त की तरह लिखो जो vacancy details bata raha ho.
Koi fixed heading structure nahi hai — lekin naturally ye sections aa sakte hain:
- एकदम शुरू में 2-4 sentences में पूरी जानकारी का सार (heading "Quick Summary" ya "सीधा जवाब")
- भर्ती का संक्षिप्त विवरण
- तिथियाँ (table में हो सकती हैं)
- पात्रता मापदंड
- आवेदन प्रक्रिया
- चयन प्रक्रिया के चरण
- कुछ सवाल-जवाब (FAQ) — हर प्रश्न **प्रश्न:** और **उत्तर:** format mein
- अंत में 2-3 lines का निष्कर्ष`
      : `/* mock-test or questions */
Post ek interactive online quiz/mock test hai.
- Introduction: yeh test kis exam ya topic ke liye hai, kitne questions hain
- Test kaise dena hai: kya karna hai (select answer, score check)
- USKE BAAD: \`\`\`mock-test fenced block with JSON (${q} questions)
- Test ke baad: weak areas ke liye revision tips
- Kuch FAQ: **प्रश्न:** /**उत्तर:** pairs in Hindi
- 2-3 lines ka closure`}
}

${mockBlockReq}`;
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

  const titleExamples: Record<StudyMaterialType, string> = {
    notes: '"SSC CGL 2026 Notes Hindi" / "Web Development HTML CSS Notes"',
    questions: '"50 SSC Math MCQ Online Practice Hindi" / "English Grammar Error Detection Questions"',
    "mock-test": '"RRB NTPC Online Mock Test Hindi 2026" / "Web Developer Mock Test Hindi 2026"',
    vacancy: '"SSC CGL 2026 Vacancy Details Hindi" / "IT Jobs Web Developer Vacancy 2026"',
  };

  const mockFenceRule =
    topic.materialType === "mock-test" || topic.materialType === "questions"
      ? `
TECHNICAL REQUIREMENT:
- "content" mein exactly EIN \`\`\`mock-test fenced JSON block HONA CHAHIYE jisme questions ka array ho.
- Answers kabhi bhi plain markdown mein mat likho.
- \`\`\`json use mat karo — sirf \`\`\`mock-test use karo.`
      : "";

  const antiPatterns = `
LIKHNE KE DHAYAN RAKHNE WALI BAATEIN (AI lagne se bachne ke liye):
- Har paragraph "अतः", "इसलिए", "इस प्रकार", "यहाँ", "ध्यान दें" se mat shuru karo. Vary karo.
- "याद रखें", "नोट करें", "महत्वपूर्ण" jaisi warnings har jagah mat lagao — sirf 1-2 jagah.
- Har cheez ko bullet point mat banao — normal paragraphs bhi likho (3-4 lines).
- लिस्ट और पैराग्राफ का मिक्स रखो। पूरा post sirf bullets ka nahi hona चाहिए।
- हर SECTION में same pattern mat do — कहीं 2 lines, कहीं 5 lines, कहीं table.
- "AI-friendly", "AEO optimized", "AI ready", "SEO friendly" — yeh words kabhi bhi content mein mat likho. Yeh sirf metadata ke liye hain.
- "Interactive", "score check", "mock test online" ko har jagah repeat mat karo.
- Natural bhasha mein likho jaise कोई real teacher लिखे — न की कोई AI template fill kar raha ho.
- Vakya की length बदलते रहो — कभी chhota (4-5 words), कभी लंबा (15-20 words).

CONTENT DEPTH (thin/low-value content REJECT hoga):
- Sirf generic advice mat do. HAR section mein kuch na kuch SPECIFIC data hona chahiye: saal, numbers, percentages, tables, formulas, code examples, dates, Article numbers, etc.
- "यह विषय बहुत महत्वपूर्ण है" ya "यह परीक्षा के लिए उपयोगी है" jaisi filler lines content mein mat daalo. Kuch concrete batao.
- Har point ko sirf 1 line mein mat khatam karo — expand karo, example do, real life scenario do.
- Kam se kam 5-6 H2 headings honi chahिए (notes/vacancy ke liye) ya 3+ (mock-test/questions ke liye).
- "सीधा जवाब" wala section GENERIC nahi hona chahiye. Actual answer do topic ke baare mein — koi bhi padh kar samajh jaye.
- 2-3 specific examples, case studies, ya real-world scenarios include karo.
- Tables ka use karo jahan comparison ya data ho.
- Sirf word count achieve karne ke liye mat likho — HAR sentence mein value honi chahiye.

IPC / LEGAL CONTENT KE LIYE (topic IPC/kanoon se related ho to):
- Content mein 2-3 baar doosri related IPC dharayon ka zikr karo (jaise "IPC Dhara 302 mein hatya ki saja ke baare mein yahan padhein")
- "Yeh bhi padhein" ya "isase related IPC dharayen" type ke natural references do
- Har major IPC dhara ka ullekh karte waqt uski category batao (sangyeya/asangyeya, bailable/non-bailable, zamaanat)
- Judiciary cases aur Supreme Court judgments ke references do jahan relevant ho
- IPC sections ko unke practical examples se connect karo — real life scenarios ke saath
- Naye BNS 2023 kanun se bhi compare karo agar relevant ho`;

  const persona = getPersona();

  return `Tum StudyMitra ke liye Hindi study material writer ho.

TUMHARA TONE:
${persona}

${antiPatterns}

${mockFenceRule}

Aaj ki date: ${month} ${year}.
Sirf Hindi (Devanagari) mein likho — Hinglish nahi.
Content ki minimum length: ${minWords} words (JSON fence ke words count nahi hote).

TOPIC: ${topic.category}
FOCUS: ${topic.hint}
KEYWORDS: ${topic.keywords} (natural tarike se 2-4 baar use karo)

METADATA (JSON fields):
- title: under 70 chars. For examples: ${titleExamples[topic.materialType]}
- slug: English, lowercase, hyphens (e.g. railway-mock-test-hindi-2026)
- excerpt: 1-2 lines, compelling, search result mein dikhega
- seo_title: under 60 chars, main keyword including ho
- seo_description: under 160 chars
- faq: 4-8 items array with question + answer (same text as in content FAQ section)

${buildContentGuidelines(topic.materialType, compact)}

${GOOGLE_SAFE_RULES}

CRITICAL: Return as VALID JSON with fields: title, slug, excerpt, seo_title, seo_description, content, faq. JSON ke andar "content" field mein pura markdown article do. "faq" field mein 6-8 question-answer objects do. Kabhi bhi JSON truncate mat karo.`;
}
