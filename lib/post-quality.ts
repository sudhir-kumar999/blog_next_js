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

export type PostQualityFailure =
  | { kind: "blocked_content"; reason: string }
  | { kind: "too_short"; words: number }
  | { kind: "invalid_title" }
  | { kind: "missing_aeo"; reason: string }
  | { kind: "missing_mock_test"; reason: string }
  | { kind: "sensitive_news" };

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

/** AI output normalization: SEO fields + embedded FAQ + AEO enrichment (no manual editing). */
export function enrichPostForSeo(
  post: GeneratedPost,
  options?: { materialType?: StudyMaterialType }
): GeneratedPost {
  const faq = post.faq?.filter((f) => f.question?.trim() && f.answer?.trim()) ?? [];
  let content = post.content.trim();

  if (!hasDirectAnswerBlock(content) && post.excerpt) {
    content = `## सीधा जवाब\n${post.excerpt.trim()}\n\n${content}`;
  } else if (!hasDirectAnswerBlock(content)) {
    content = `## सीधा जवाब\n${post.title} के बारे में यह पोस्ट विस्तृत जानकारी और तैयारी सामग्री प्रदान करता है। ${options?.materialType === "notes" ? "ये नोट्स परीक्षा की तैयारी के लिए महत्वपूर्ण हैं।" : options?.materialType === "mock-test" ? "इस मॉक टेस्ट से अपनी तैयारी जांचें।" : "यह सामग्री आपकी तैयारी में मदद करेगी।"}\n\n${content}`;
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

  if (!hasDirectAnswerBlock(post.content)) {
    return { kind: "missing_aeo", reason: "Missing ## सीधा जवाब section for AI visibility" };
  }

  const faqCount = post.faq?.length ?? (post.content.match(/\*\*प्रश्न:\*\*/g)?.length ?? 0);
  if (faqCount < 6) {
    return { kind: "missing_aeo", reason: "Need at least 6 FAQ items for AEO (AI visibility), got " + faqCount };
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

  const words = countWords(stripMockTestBlocks(post.content));
  if (words < MIN_POST_WORDS) {
    return { kind: "too_short", words };
  }

  return null;
}
