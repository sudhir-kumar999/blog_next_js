import type { GeneratedPost } from "./gemini";
import { embedFaqComment, hasDirectAnswerBlock } from "./aeo";
import { extractMockTestsFromMarkdown, stripMockTestBlocks } from "@/lib/mock-test/parse";
import { ensureMockTestSeoFields } from "@/lib/seo";
import type { StudyMaterialType } from "@/lib/study-material";
import { countWords, MIN_POST_WORDS } from "./wordCount";

const BLOCKED_CONTENT_PATTERNS: RegExp[] = [
  /\b(100%|guaranteed)\s+(selection|pass|job|result)/i,
  /\b(90\s*%\+|100\s*%)\s*(score|marks|selection)/i,
  /\b(free\s+)?download\s+(movie|film|web\s*series|pirated)/i,
  /click\s+here\s+to\s+win/i,
  /share\s+\d+\s+times\s+to\s+unlock/i,
  /communal\s+(violence|riot)/i,
  /AIza[A-Za-z0-9_-]{20,}/,
  /api[_-]?key\s*[:=]\s*["']?[A-Za-z0-9_-]+/i,
];

const SENSITIVE_CONTENT_PATTERNS: RegExp[] = [
  /hatya|हत्या|rape|बलात्कार|lynch|lynching|terror\s+attack|आत्महत्या|suicide/i,
];

const GENERIC_FILLER_PATTERNS: RegExp[] = [
  /यह विषय बहुत महत्वपूर्ण/i,
  /यह परीक्षा के लिए बहुत उपयोगी/i,
  /यह लेख आपकी तैयारी में मदद करेगा/i,
  /इस लेख में हम जानेंगे/i,
  /आपको यह जानकारी याद रखनी चाहिए/i,
  /यह आपके लिए बहुत लाभदायक/i,
  /हम आशा करते हैं/i,
  /हमें उम्मीद है/i,
  /अगर आपको यह पोस्ट पसंद आए/i,
];

const QUESTION_WORDS = /^(क्या|कौन|कैसे|क्यों|कब|कहाँ|कितने|what|how|why|when|where)\b/i;

export type PostQualityFailure =
  | { kind: "blocked_content"; reason: string }
  | { kind: "too_short"; words: number; minWords: number }
  | { kind: "invalid_title" }
  | { kind: "missing_aeo"; reason: string }
  | { kind: "missing_mock_test"; reason: string }
  | { kind: "sensitive_news" }
  | { kind: "too_few_headings"; count: number; min: number }
  | { kind: "too_much_filler"; ratio: number }
  | { kind: "too_shallow"; reason: string }
  | { kind: "generic_direct_answer" };

export function sanitizeSlug(slug: string): string {
  return (
    slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `post-${Date.now().toString(36)}`
  );
}

function countH2Headings(content: string): number {
  const matches = content.match(/^##\s+.+/gm);
  return matches ? matches.length : 0;
}

function fillerRatio(content: string): number {
  if (!content) return 0;
  let matchCount = 0;
  for (const p of GENERIC_FILLER_PATTERNS) {
    const matches = content.match(p);
    if (matches) matchCount += matches.length;
  }
  const words = countWords(content);
  if (words < 100) return 0;
  return matchCount / (words / 100);
}

function hasSpecificData(content: string): boolean {
  const dataPatterns = [
    /\b\d{4}\b/,           // year like 2026
    /\b\d+%/,               // percentage
    /\b(₹|Rs\.?)\s*\d+/,   // rupee amounts
    /\d+\s*(kg|km|cm|m|hr|min|sec|days|months)/i, // measurements
    /\d+\s*-\s*\d+/,        // ranges like 10-15
    /```[\s\S]{20,}```/,    // code blocks
    /\|[^|]+\|[^|]+\|/,     // tables
    /\b(Article|Section|Chapter|Unit)\s+\d+/i, // references
  ];
  return dataPatterns.some((p) => p.test(content));
}

function isGenericDirectAnswer(content: string): boolean {
  const match = content.match(
    /##\s*(सीधा जवाब|Short answer|Quick answer)\s*\n([\s\S]*?)(?=\n##|\n---|$)/
  );
  if (!match) return false;
  const answer = match[2].trim().toLowerCase();
  const genericPhrases = [
    "के बारे में यह पोस्ट विस्तृत जानकारी",
    "यह सामग्री आपकी तैयारी में मदद करेगी",
    "यह पोस्ट आपको बताता है",
    "इस लेख में हम चर्चा करेंगे",
    "यह लेख आपको प्रदान करता है",
  ];
  return genericPhrases.some((p) => answer.includes(p));
}

/** AI output normalization: SEO fields + embedded FAQ + AEO enrichment. */
export function enrichPostForSeo(
  post: GeneratedPost,
  options?: { materialType?: StudyMaterialType }
): GeneratedPost {
  const faq = post.faq?.filter((f) => f.question?.trim() && f.answer?.trim()) ?? [];
  let content = post.content.trim();

  if (!hasDirectAnswerBlock(content) && post.excerpt) {
    content = `## सीधा जवाब\n${post.excerpt.trim()}\n\n${content}`;
  }

  if (faq.length > 0) {
    content = embedFaqComment(content, faq);
  }

  let seo_title = (post.seo_title || post.title).trim().slice(0, 70);
  let seo_description = (post.seo_description || post.excerpt).trim().slice(0, 160);

  if (options?.materialType === "mock-test" || options?.materialType === "questions") {
    const examHint = post.title.split(/[—–:-]/)[0]?.trim() || "Exam";
    const fixed = ensureMockTestSeoFields(seo_title, seo_description, examHint);
    seo_title = fixed.seo_title;
    seo_description = fixed.seo_description;
  }

  return {
    ...post,
    slug: sanitizeSlug(post.slug),
    title: post.title.trim().slice(0, 120),
    excerpt: post.excerpt.trim().slice(0, 160),
    seo_title,
    seo_description,
    content,
    faq: faq.length > 0 ? faq : undefined,
  };
}

export function validatePostQuality(
  post: GeneratedPost,
  options?: { materialType?: StudyMaterialType }
): PostQualityFailure | null {
  if (!post.title?.trim() || post.title.trim().length < 8) {
    return { kind: "invalid_title" };
  }

  const combined = `${post.title}\n${post.excerpt}\n${post.content}`;
  for (const pattern of BLOCKED_CONTENT_PATTERNS) {
    if (pattern.test(combined)) {
      return {
        kind: "blocked_content",
        reason: `Content matched blocked pattern: ${pattern.source.slice(0, 40)}`,
      };
    }
  }

  for (const pattern of SENSITIVE_CONTENT_PATTERNS) {
    if (pattern.test(combined)) {
      return { kind: "sensitive_news" };
    }
  }

  if (isGenericDirectAnswer(post.content)) {
    return { kind: "generic_direct_answer" };
  }

  if (!hasDirectAnswerBlock(post.content)) {
    return { kind: "missing_aeo", reason: "Missing ## सीधा जवाब section for AI visibility" };
  }

  const faqCount = post.faq?.length ?? (post.content.match(/\*\*प्रश्न:\*\*/g)?.length ?? 0);
  if (faqCount < 4) {
    return { kind: "missing_aeo", reason: "Need at least 4 FAQ items for AEO (AI visibility), got " + faqCount };
  }

  const contentBody = stripMockTestBlocks(post.content);
  const words = countWords(contentBody);
  if (words < MIN_POST_WORDS) {
    return { kind: "too_short", words, minWords: MIN_POST_WORDS };
  }

  const h2Count = countH2Headings(contentBody);
  const minH2 = options?.materialType === "notes" || options?.materialType === "vacancy" ? 5 : 3;
  if (h2Count < minH2) {
    return { kind: "too_few_headings", count: h2Count, min: minH2 };
  }

  const fillerRatio_ = fillerRatio(contentBody);
  if (fillerRatio_ > 0.8) {
    return { kind: "too_much_filler", ratio: Math.round(fillerRatio_ * 100) / 100 };
  }

  if (!hasSpecificData(contentBody)) {
    return {
      kind: "too_shallow",
      reason: "No specific data found: no years, percentages, code blocks, tables, or references. Content reads like generic advice.",
    };
  }

  const hasBulletOrNumberedList = /(^|\n)[*-]\s|\d+\.\s/.test(post.content);
  if (!hasBulletOrNumberedList) {
    return { kind: "missing_aeo", reason: "Content needs bullet points or numbered lists for AI readability" };
  }

  const hasTableOrCodeBlock = /(\|.+\|.+\||```)/.test(post.content);
  if (!hasTableOrCodeBlock) {
    return { kind: "missing_aeo", reason: "Content needs at least one table or code block for AI structure" };
  }

  if (options?.materialType === "mock-test" || options?.materialType === "questions") {
    const tests = extractMockTestsFromMarkdown(post.content);
    if (tests.length === 0) {
      return {
        kind: "missing_mock_test",
        reason:
          'Missing ```mock-test JSON fence with interactive quiz (mcq/tf/short). Plain-text MCQ lists are rejected.',
      };
    }
    const minQ = options.materialType === "mock-test" ? 8 : 5;
    if (tests[0].questions.length < minQ) {
      return {
        kind: "missing_mock_test",
        reason: `Mock test needs at least ${minQ} questions in JSON, got ${tests[0].questions.length}`,
      };
    }
  }

  return null;
}
