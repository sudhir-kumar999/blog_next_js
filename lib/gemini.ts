import { GoogleGenAI } from "@google/genai";
import { countWords, MIN_POST_WORDS } from "./wordCount";

// Single fast model — trying multiple models adds latency and risks timeout.
const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;
const MAX_OUTPUT_TOKENS = 16384;

function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

function getGeminiModels(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (fromEnv) return [fromEnv, ...DEFAULT_MODELS.filter((m) => m !== fromEnv)];
  return [...DEFAULT_MODELS];
}

export function getGeminiKeyFingerprint(): string | null {
  const key = getGeminiApiKey();
  if (!key) return null;
  return key.slice(-4);
}

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  content: string;
}

export type GenerateBlogPostFailure =
  | { kind: "missing_api_key" }
  | { kind: "project_suspended"; projectId?: string }
  | { kind: "api_error"; status?: number; message: string }
  | { kind: "empty_model_text" }
  | { kind: "truncated_response" }
  | { kind: "json_parse_failed"; preview: string }
  | { kind: "too_short"; words: number; minWords: number };

function isRetryableFailure(failure: GenerateBlogPostFailure): boolean {
  return (
    failure.kind === "json_parse_failed" ||
    failure.kind === "truncated_response" ||
    failure.kind === "too_short"
  );
}

function parseGeminiApiError(err: unknown): GenerateBlogPostFailure {
  const raw = err instanceof Error ? err.message : String(err);
  const sanitized = raw
    .replace(/api_key:[A-Za-z0-9_-]+/gi, "api_key:[REDACTED]")
    .replace(/AIza[A-Za-z0-9_-]+/g, "[REDACTED_KEY]");

  const projectMatch = sanitized.match(/projects\/(\d+)/);
  const projectId = projectMatch?.[1];

  if (/CONSUMER_SUSPENDED|has been suspended/i.test(sanitized)) {
    return {
      kind: "project_suspended",
      projectId,
    };
  }

  let status: number | undefined;
  const statusMatch = sanitized.match(/"code":\s*(\d{3})/);
  if (statusMatch) status = Number(statusMatch[1]);

  const messageMatch = sanitized.match(/"message":\s*"([^"]+)"/);
  const apiMessage = messageMatch?.[1];

  if (status === 404 || /is not found for API version/i.test(sanitized)) {
    return {
      kind: "api_error",
      status: 404,
      message: apiMessage ?? "Gemini model not found — will try next model",
    };
  }

  return {
    kind: "api_error",
    status,
    message: apiMessage ?? (sanitized.slice(0, 400) || "Gemini API request failed"),
  };
}

function isModelNotFoundFailure(failure: GenerateBlogPostFailure): boolean {
  return failure.kind === "api_error" && failure.status === 404;
}

export async function testGeminiConnection(): Promise<
  | { ok: true; model: string; keySuffix: string }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false, failure: { kind: "missing_api_key" } };

  const ai = new GoogleGenAI({ apiKey });
  for (const model of getGeminiModels()) {
    try {
      await ai.models.generateContent({
        model,
        contents: "Reply with exactly: ok",
        config: { maxOutputTokens: 16 },
      });
      return { ok: true, model, keySuffix: apiKey.slice(-4) };
    } catch (err) {
      const failure = parseGeminiApiError(err);
      if (failure.kind === "project_suspended") {
        return { ok: false, failure };
      }
      // Try next model on 404 (model name not available for this API key).
      if (!isModelNotFoundFailure(failure)) {
        return { ok: false, failure };
      }
    }
  }

  return {
    ok: false,
    failure: {
      kind: "api_error",
      message:
        "No Gemini model worked. Set GEMINI_MODEL=gemini-2.5-flash in Vercel and redeploy.",
    },
  };
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

function buildPrompt(compact = false): string {
  const topic = getTodaysTopic();
  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const mcqCount = compact ? 10 : 12;
  const factCount = compact ? 8 : 10;

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
- Content MUST be at least ${minWords} words (count only the "content" field)
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
- Exactly ${mcqCount} MCQ questions (not more) in this EXACT format:

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
- Top ${factCount} most repeated exam facts
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
- CRITICAL: Return the COMPLETE JSON in one response — never cut off mid-string. Finish "content" and close all braces.

Now generate the blog post.`;
}

function extractFinishReason(response: unknown): string | undefined {
  try {
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      !!v && typeof v === "object" && !Array.isArray(v);
    const root = isRecord(response) ? response : undefined;
    const candidates = root?.candidates;
    if (!Array.isArray(candidates) || !candidates[0]) return undefined;
    const first = candidates[0];
    if (!isRecord(first)) return undefined;
    const reason = first.finishReason ?? first.finish_reason;
    return typeof reason === "string" ? reason : undefined;
  } catch {
    return undefined;
  }
}

function isTruncatedResponse(response: unknown, text: string): boolean {
  const reason = extractFinishReason(response);
  if (reason === "MAX_TOKENS" || reason === "max_tokens") return true;
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return false;
  if (trimmed.endsWith("}")) return false;
  return true;
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
  // Strip markdown code fences if the model wraps JSON in ```json ...```.
  // Sometimes the closing fence is missing in truncated outputs, so handle both cases.
  if (text.startsWith("```")) {
    // Remove the opening fence line: ``` or ```json
    const firstNewline = text.indexOf("\n");
    if (firstNewline >= 0) text = text.slice(firstNewline + 1).trim();
    // Remove a trailing closing fence if present
    const lastFence = text.lastIndexOf("```");
    if (lastFence >= 0) text = text.slice(0, lastFence).trim();
  } else {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) text = codeBlock[1].trim();
  }
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

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  compact: boolean
): Promise<Awaited<ReturnType<typeof ai.models.generateContent>>> {
  return ai.models.generateContent({
    model,
    contents: buildPrompt(compact),
    config: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.6,
      topP: 0.95,
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        additionalProperties: false,
        required: ["title", "slug", "excerpt", "seo_title", "seo_description", "content"],
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          excerpt: { type: "string" },
          seo_title: { type: "string" },
          seo_description: { type: "string" },
          content: { type: "string" },
        },
      },
    },
  });
}

async function attemptGenerate(
  apiKey: string,
  compact: boolean
): Promise<
  | { ok: true; post: GeneratedPost }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const ai = new GoogleGenAI({ apiKey });
  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
  let lastApiFailure: GenerateBlogPostFailure | null = null;

  for (const model of getGeminiModels()) {
    try {
      response = await generateWithModel(ai, model, compact);
      break;
    } catch (err) {
      lastApiFailure = parseGeminiApiError(err);
      console.error(`[gemini] model ${model} failed:`, lastApiFailure);
      if (lastApiFailure.kind === "project_suspended") {
        return { ok: false, failure: lastApiFailure };
      }
      if (!isModelNotFoundFailure(lastApiFailure)) {
        return { ok: false, failure: lastApiFailure };
      }
    }
  }

  if (!response) {
    return {
      ok: false,
      failure: lastApiFailure ?? {
        kind: "api_error",
        message: "Gemini API request failed. Set GEMINI_MODEL=gemini-2.5-flash in Vercel.",
      },
    };
  }

  const text = extractModelText(response);
  if (!text) return { ok: false, failure: { kind: "empty_model_text" } };

  if (isTruncatedResponse(response, text)) {
    console.error("[gemini] response truncated (MAX_TOKENS or incomplete JSON)");
    return { ok: false, failure: { kind: "truncated_response" } };
  }

  const post = parseGeneratedJson(text);
  if (!post) {
    const preview = text.slice(0, 600);
    console.error("[gemini] failed to parse JSON. First 600 chars:", preview);
    return { ok: false, failure: { kind: "json_parse_failed", preview } };
  }

  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const words = countWords(post.content);
  if (words < minWords) {
    console.error(`[gemini] generated content too short: ${words} words (min ${minWords}).`);
    return { ok: false, failure: { kind: "too_short", words, minWords } };
  }

  return { ok: true, post };
}

export async function generateBlogPost(): Promise<
  | { ok: true; post: GeneratedPost }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false, failure: { kind: "missing_api_key" } };

  const forceCompact =
    process.env.GEMINI_COMPACT === "1" || process.env.GEMINI_COMPACT === "true";
  const modes: boolean[] = forceCompact ? [true] : [false, true];
  let lastFailure: GenerateBlogPostFailure | null = null;

  for (const compact of modes) {
    const result = await attemptGenerate(apiKey, compact);
    if (result.ok) return result;

    lastFailure = result.failure;
    if (result.failure.kind === "project_suspended") {
      return result;
    }
    if (!isRetryableFailure(result.failure)) {
      return result;
    }
    console.error(`[gemini] attempt failed (compact=${compact}), retrying...`, result.failure.kind);
  }

  return { ok: false, failure: lastFailure ?? { kind: "api_error", message: "Generation failed" } };
}