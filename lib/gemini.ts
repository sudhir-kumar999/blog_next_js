import { GoogleGenAI } from "@google/genai";
import {
  resolveStudyTopic,
  type PostSlot,
  type StudyMaterialType,
} from "./study-material";

export type { PostSlot } from "./study-material";
export { parsePostSlot } from "./study-material";
import { enrichPostForSeo, validatePostQuality, type PostQualityFailure } from "./post-quality";
import { countWords, MIN_POST_WORDS } from "./wordCount";

// One model = fewer API calls (helps avoid quota suspension). Set GEMINI_FALLBACK_MODEL for backup.
const DEFAULT_MODELS = ["gemini-2.5-flash"] as const;
const MAX_OUTPUT_TOKENS = 16384;
const MAX_GENERATION_ATTEMPTS = 2;

function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
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
  faq?: { question: string; answer: string }[];
}

export type GenerateBlogPostFailure =
  | { kind: "missing_api_key" }
  | { kind: "project_suspended"; projectId?: string }
  | { kind: "quota_exceeded" }
  | { kind: "api_error"; status?: number; message: string }
  | { kind: "empty_model_text" }
  | { kind: "truncated_response" }
  | { kind: "json_parse_failed"; preview: string }
  | { kind: "too_short"; words: number; minWords: number }
  | { kind: "content_blocked"; reason: string };

function getGeminiModels(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim();
  const models: string[] = [];
  if (fromEnv) models.push(fromEnv);
  else models.push(...DEFAULT_MODELS);
  if (fallback && !models.includes(fallback)) models.push(fallback);
  else if (!fromEnv) {
    const extra = DEFAULT_MODELS.filter((m) => !models.includes(m));
    models.push(...extra);
  }
  return models;
}

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

  if (
    /RESOURCE_EXHAUSTED|quota exceeded|rate limit|429|too many requests/i.test(sanitized)
  ) {
    return { kind: "quota_exceeded" };
  }

  let status: number | undefined;
  const statusMatch = sanitized.match(/"code":\s*(\d{3})/);
  if (statusMatch) status = Number(statusMatch[1]);

  const messageMatch = sanitized.match(/"message":\s*"([^"]+)"/);
  const apiMessage = messageMatch?.[1];

  if (status === 429) {
    return { kind: "quota_exceeded" };
  }

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

import { enrichPostForSeo, validatePostQuality, type PostQualityFailure } from "./post-quality";
import { countWords } from "./wordCount";
import { buildContentStructure, buildPrompt } from "./gemini-prompts";

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
  const faqRaw = parsed.faq;
  let faq: { question: string; answer: string }[] | undefined;
  if (Array.isArray(faqRaw)) {
    faq = faqRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const q = String(item.question ?? "").trim();
        const a = String(item.answer ?? "").trim();
        return q && a ? { question: q, answer: a } : null;
      })
      .filter((x) => x !== null);
    if (faq.length === 0) faq = undefined;
  }
  if (!title || !content) return null;
  return {
    title,
    slug: slug || "post-" + Date.now(),
    excerpt: excerpt || title,
    seo_title: seo_title || title,
    seo_description: seo_description || excerpt || title,
    content,
    faq,
  };
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  compact: boolean,
  slot: PostSlot
): Promise<Awaited<ReturnType<typeof ai.models.generateContent>>> {
  return ai.models.generateContent({
    model,
    contents: buildPrompt(compact, slot),
    config: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.6,
      topP: 0.95,
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        additionalProperties: false,
        required: ["title", "slug", "excerpt", "seo_title", "seo_description", "content", "faq"],
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          excerpt: { type: "string" },
          seo_title: { type: "string" },
          seo_description: { type: "string" },
          content: { type: "string" },
          faq: {
            type: "array",
            minItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["question", "answer"],
              properties: {
                question: { type: "string" },
                answer: { type: "string" },
              },
            },
          },
        },
      },
    },
  });
}

async function attemptGenerate(
  apiKey: string,
  compact: boolean,
  slot: PostSlot
): Promise<
  | { ok: true; post: GeneratedPost }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const ai = new GoogleGenAI({ apiKey });
  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
  let lastApiFailure: GenerateBlogPostFailure | null = null;

  for (const model of getGeminiModels()) {
    try {
      response = await generateWithModel(ai, model, compact, slot);
      break;
    } catch (err) {
      lastApiFailure = parseGeminiApiError(err);
      console.error(`[gemini] model ${model} failed:`, lastApiFailure);
      if (
        lastApiFailure.kind === "project_suspended" ||
        lastApiFailure.kind === "quota_exceeded"
      ) {
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

  const finishReason = extractFinishReason(response);
  if (finishReason === "SAFETY" || finishReason === "RECITATION") {
    return {
      ok: false,
      failure: { kind: "content_blocked", reason: `Model blocked output: ${finishReason}` },
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

  const enriched = enrichPostForSeo(post);
  const qualityIssue = validatePostQuality(enriched);
  if (qualityIssue) {
    const reason = qualityFailureToMessage(qualityIssue);
    console.error("[gemini] content quality blocked:", reason);
    return { ok: false, failure: { kind: "content_blocked", reason } };
  }

  return { ok: true, post: enriched };
}

function qualityFailureToMessage(f: PostQualityFailure): string {
  switch (f.kind) {
    case "blocked_content":
      return f.reason;
    case "sensitive_news":
      return "Sensitive news topic — skipped for policy safety";
    case "too_short":
      return `Too short: ${f.words} words`;
    case "invalid_title":
      return "Invalid or missing title";
    case "missing_aeo":
      return f.reason;
    default:
      return "Content quality check failed";
  }
}

export async function generateBlogPost(options?: { slot?: PostSlot }): Promise<
  | { ok: true; post: GeneratedPost; slot: PostSlot; materialType: import("./study-material").StudyMaterialType }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false, failure: { kind: "missing_api_key" } };

  const slot: PostSlot = options?.slot ?? 0;
  const forceCompact =
    process.env.GEMINI_COMPACT === "1" || process.env.GEMINI_COMPACT === "true";
  const modes: boolean[] = forceCompact ? [true] : [false, true];
  let lastFailure: GenerateBlogPostFailure | null = null;
  let attempts = 0;

  for (const compact of modes) {
    if (attempts >= MAX_GENERATION_ATTEMPTS) break;
    attempts++;

    const result = await attemptGenerate(apiKey, compact, slot);
    if (result.ok) {
      const materialType = resolveStudyTopic(slot).materialType;
      return { ...result, slot, materialType };
    }

    lastFailure = result.failure;
    if (
      result.failure.kind === "project_suspended" ||
      result.failure.kind === "quota_exceeded"
    ) {
      return result;
    }
    if (!isRetryableFailure(result.failure)) {
      return result;
    }
    console.error(`[gemini] attempt failed (compact=${compact}), retrying...`, result.failure.kind);
  }

  return { ok: false, failure: lastFailure ?? { kind: "api_error", message: "Generation failed" } };
}