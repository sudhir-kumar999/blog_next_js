import type { GeneratedPost } from "./gemini";
import { countWords, MIN_POST_WORDS } from "./wordCount";

/** Patterns that risk Google policy violations or site penalties — block publish */
const BLOCKED_CONTENT_PATTERNS: RegExp[] = [
  /\b(100%|guaranteed)\s+(selection|pass|job|result)/i,
  /\b(free\s+)?download\s+(movie|film|web\s*series|pirated)/i,
  /click\s+here\s+to\s+win/i,
  /share\s+\d+\s+times\s+to\s+unlock/i,
  /communal\s+(violence|riot)/i,
  /AIza[A-Za-z0-9_-]{20,}/,
  /api[_-]?key\s*[:=]\s*["']?[A-Za-z0-9_-]+/i,
];

/** Soft warnings — log but allow if only minor */
const SENSITIVE_NEWS_PATTERNS: RegExp[] = [
  /hatya|हत्या|rape|बलात्कार|lynch|lynching|terror\s+attack|आत्महत्या|suicide/i,
];

export type PostQualityFailure =
  | { kind: "blocked_content"; reason: string }
  | { kind: "too_short"; words: number }
  | { kind: "invalid_title" }
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

export function enrichPostForSeo(post: GeneratedPost): GeneratedPost {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.studymitra.in";
  const slug = sanitizeSlug(post.slug);
  const hasSiteLink = post.content.includes(siteUrl) || post.content.includes("studymitra.in");

  const seoFooter = hasSiteLink
    ? ""
    : `\n\n---\n📚 **और भी उपयोगी गाइड:** [Study Mitra](${siteUrl}/blog) पर रोज़ाना नई पोस्ट — पढ़ाई, करंट अफेयर्स और ट्रेंडिंग टॉपिक।\n`;

  return {
    ...post,
    slug,
    title: post.title.trim().slice(0, 120),
    excerpt: post.excerpt.trim().slice(0, 160),
    seo_title: (post.seo_title || post.title).trim().slice(0, 70),
    seo_description: (post.seo_description || post.excerpt).trim().slice(0, 160),
    content: post.content.trim() + seoFooter,
  };
}

export function validatePostQuality(post: GeneratedPost): PostQualityFailure | null {
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

  for (const pattern of SENSITIVE_NEWS_PATTERNS) {
    if (pattern.test(combined)) {
      return { kind: "sensitive_news" };
    }
  }

  const words = countWords(post.content);
  if (words < MIN_POST_WORDS - 100) {
    return { kind: "too_short", words };
  }

  return null;
}
