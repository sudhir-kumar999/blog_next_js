import { GoogleGenAI } from "@google/genai";
import { countWords, MIN_POST_WORDS } from "./wordCount";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const model = "gemini-2.5-flash";

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  content: string;
}

const COMPETITION_TOPICS = [
  { category: "सामान्य ज्ञान - भारतीय इतिहास", keywords: "Indian History GK, भारतीय इतिहास प्रश्न उत्तर, SSC History MCQ", hint: "Mughal Empire, Freedom Movement, Ancient India, Medieval India" },
  { category: "सामान्य ज्ञान - भूगोल", keywords: "Geography GK Hindi, भूगोल प्रश्न उत्तर, Railway Geography MCQ", hint: "Rivers, Mountains, States, Climate, National Parks" },
  { category: "सामान्य ज्ञान - भारतीय संविधान और राजव्यवस्था", keywords: "Polity GK Hindi, संविधान प्रश्न उत्तर, UPSC Polity MCQ", hint: "Fundamental Rights, Parliament, President, Courts, Articles" },
  { category: "सामान्य विज्ञान - भौतिकी", keywords: "Physics GK Hindi, सामान्य विज्ञान प्रश्न, SSC Science MCQ", hint: "Newton Laws, Light, Sound, Electricity, Force" },
  { category: "सामान्य विज्ञान - रसायन विज्ञान", keywords: "Chemistry GK Hindi, रसायन विज्ञान प्रश्न उत्तर, Railway Science", hint: "Elements, Acids, Bases, Chemical Reactions, Periodic Table" },
  { category: "सामान्य विज्ञान - जीव विज्ञान", keywords: "Biology GK Hindi, जीव विज्ञान प्रश्न, SSC Biology MCQ", hint: "Human Body, Diseases, Plants, Animals, Vitamins" },
  { category: "हिंदी व्याकरण", keywords: "Hindi Grammar MCQ, हिंदी व्याकरण प्रश्न उत्तर, SSC Hindi", hint: "Sandhi, Samas, Muhavare, Alankar, Vilom Shabd, Paryayvachi" },
  { category: "गणित - शॉर्ट ट्रिक्स और फॉर्मूला", keywords: "Math Tricks Hindi, गणित शॉर्ट ट्रिक्स, SSC Math Shortcuts", hint: "Percentage, Ratio, SI/CI, Speed-Time, Profit-Loss, Algebra" },
  { category: "तार्किक योग्यता - Reasoning", keywords: "Reasoning MCQ Hindi, तार्किक योग्यता प्रश्न, SSC Reasoning", hint: "Series, Analogy, Coding-Decoding, Blood Relations, Puzzles" },
  { category: "कंप्यूटर ज्ञान", keywords: "Computer GK Hindi, कंप्यूटर प्रश्न उत्तर, Bank Computer MCQ", hint: "MS Office, Internet, Hardware, Software, Shortcut Keys, OS" },
  { category: "करंट अफेयर्स - राष्ट्रीय और अंतर्राष्ट्रीय", keywords: "Current Affairs Hindi 2025, करंट अफेयर्स प्रश्न, Monthly GK 2025", hint: "Awards, Sports, Government Schemes, Appointments, Summits" },
  { category: "अर्थव्यवस्था - Economy GK", keywords: "Economy GK Hindi, भारतीय अर्थव्यवस्था प्रश्न, UPSC Economy MCQ", hint: "GDP, Budget, RBI, Banking, Five Year Plans, Tax System" },
  { category: "English Grammar for Competitive Exams", keywords: "English Grammar MCQ Hindi, Tenses, SSC English Questions", hint: "Tenses, Articles, Prepositions, Active Passive, Error Spotting" },
  { category: "पर्यावरण और पारिस्थितिकी", keywords: "Environment GK Hindi, पर्यावरण प्रश्न उत्तर, UPSC Environment", hint: "Pollution, Climate Change, Wildlife, National Parks, Treaties" },
  { category: "खेल-कूद सामान्य ज्ञान", keywords: "Sports GK Hindi, खेल प्रश्न उत्तर, Sports Current Affairs 2025", hint: "Olympics, Cricket, Football, Awards, Indian Sports Achievements" },
];

function getTodaysTopic() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const primaryIndex = dateSeed % COMPETITION_TOPICS.length;
  const randomOffset = Math.floor(Math.random() * 3);
  const finalIndex = (primaryIndex + randomOffset) % COMPETITION_TOPICS.length;
  return COMPETITION_TOPICS[finalIndex];
}

function buildPrompt(): string {
  const topic = getTodaysTopic();

  return `You are an expert Hindi blog writer for an Indian education website like Study Mitra, Sarkari Result, or Result Bharat. Your audience is Indian students preparing for exams, competitive exams, and general learning.

Generate ONE complete blog post. Return ONLY a valid JSON object (no markdown block, no code block, no extra text) with exactly these keys:

- "title": string, catchy and SEO-friendly, under 70 characters
- "slug": string, URL-friendly, lowercase, hyphens only (e.g. "ssc-cgl-2026-notification")
- "excerpt": string, 1-2 sentences for meta description, under 160 characters
- "seo_title": string, optional SEO title (can be same as title)
- "seo_description": string, optional SEO description (can be same as excerpt)
- "content": string, FULL article body in Markdown

CONTENT RULES:
- Write in simple Hindi (Devanagari script)
- Content MUST be at least ${MIN_POST_WORDS} words
- Use clear headings (##, ###), short paragraphs, and bullet points
- SEO optimized — naturally use these keywords 5-8 times: ${topic.keywords}
- 100% original content (no plagiarism)
- Use latest year references like 2025 or 2026 when relevant
- Make content engaging and easy to understand for students

TOPIC (DO NOT CHANGE THIS):
Write ONLY on this topic: ${topic.category}
Focus areas: ${topic.hint}

CONTENT STRUCTURE:

👉 Introduction (प्रस्तावना):
- Topic का महत्व competitive exams में
- किन exams में यह topic आता है (SSC, Railway, UPSC, Police, Bank etc.)

👉 Main Notes (मुख्य नोट्स):
- Easy Hindi में explanation
- Important definitions, facts, formulas
- Tables or bullet points for quick revision

👉 Important MCQ Questions (महत्वपूर्ण प्रश्न उत्तर):
- MINIMUM 20 MCQ questions in this EXACT format:

**Q1. [Question]?**
- (A) Option1
- (B) Option2
- (C) Option3
- (D) Option4
✅ **उत्तर: (X) [Correct Answer]**
💡 **व्याख्या:** [1-2 line explanation in Hindi]

👉 Short Tricks (शॉर्ट ट्रिक्स):
- Memory tricks in Hindi
- Mnemonics or shortcuts

👉 Exam Ready Facts (परीक्षा में बार-बार पूछे गए तथ्य):
- Top 15 most repeated exam facts
- Bullet list for fast revision

👉 Conclusion (निष्कर्ष):
- Summary in 2-3 lines
- "इसे अपने दोस्तों के साथ शेयर करें"

SLUG RULE:
- Use English keywords from topic, lowercase, hyphens only
- Example: "bhartiya-itihas-gk-questions-hindi-2025"

IMPORTANT:
- Do NOT change the assigned topic
- Do NOT include job alerts, admit cards, results, or admission posts
- Do NOT include anything except JSON
- Do NOT wrap response in markdown or code block
- Ensure JSON is valid and parsable

Now generate the blog post.`;
}

function extractModelText(response: unknown): string {
  // The @google/genai SDK response shape differs across versions/paths.
  // We defensively extract the first plausible text we can find.
  try {
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      !!v && typeof v === "object" && !Array.isArray(v);
    const getRecord = (obj: unknown, key: string): Record<string, unknown> | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return isRecord(val) ? val : undefined;
    };
    const getString = (obj: unknown, key: string): string | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return typeof val === "string" ? val : undefined;
    };
    const getFn = (obj: unknown, key: string): ((...args: unknown[]) => unknown) | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return typeof val === "function" ? (val as (...args: unknown[]) => unknown) : undefined;
    };
    const getArray = (obj: unknown, key: string): unknown[] | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return Array.isArray(val) ? val : undefined;
    };

    const directText = getString(response, "text");
    if (directText?.trim()) return directText.trim();

    const textFn = getFn(response, "text");
    if (textFn) {
      const t = textFn();
      if (typeof t === "string" && t.trim()) return t.trim();
    }

    const innerResponse = getRecord(response, "response");
    if (innerResponse) {
      const innerTextFn = getFn(innerResponse, "text");
      if (innerTextFn) {
        const t = innerTextFn();
        if (typeof t === "string" && t.trim()) return t.trim();
      }
      const innerText = getString(innerResponse, "text");
      if (innerText?.trim()) return innerText.trim();
    }

    const extractFromCandidates = (root: unknown): string => {
      const candidates = getArray(root, "candidates");
      const first = candidates?.[0];
      const content = getRecord(first, "content");
      const parts = getArray(content, "parts");
      const joined =
        parts
          ?.map((p) => {
            const t = getString(p, "text");
            return typeof t === "string" ? t : "";
          })
          .join("") ?? "";
      return joined;
    };

    const candidateText = extractFromCandidates(response);
    if (candidateText.trim()) return candidateText.trim();

    const nestedCandidateText = extractFromCandidates(innerResponse);
    if (nestedCandidateText.trim()) return nestedCandidateText.trim();
  } catch {
    // ignore
  }
  return "";
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  // 1) Direct parse
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }

  // 2) If the model added extra prose, try the first {...} block.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      // ignore
    }
  }

  return null;
}

function parseGeneratedJson(raw: string): GeneratedPost | null {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const parsed = tryParseJsonObject(text);
  if (!parsed) return null;

  const title = String(parsed.title ?? "").trim();
  const slug = String(parsed.slug ?? title)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const excerpt = String(parsed.excerpt ?? "").trim();
  const seo_title = String(parsed.seo_title ?? title).trim();
  const seo_description = String(parsed.seo_description ?? excerpt).trim();
  const content = String(parsed.content ?? "").trim();
  if (!title || !content) return null;
  return {
    title,
    slug: slug || "post-" + Date.now(),
    excerpt: excerpt || title,
    seo_title: seo_title || title,
    seo_description: seo_description || excerpt || title,
    content,
  };
}

export async function generateBlogPost(): Promise<GeneratedPost | null> {
  if (!GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(),
  });

  const text = extractModelText(response);
  if (!text) return null;

  const post = parseGeneratedJson(text);
  if (!post) {
    console.error("[gemini] failed to parse JSON. First 600 chars:", text.slice(0, 600));
    return null;
  }

  const words = countWords(post.content);
  if (words < MIN_POST_WORDS) {
    console.error(`[gemini] generated content too short: ${words} words (min ${MIN_POST_WORDS}).`);
    return null;
  }

  return post;
}