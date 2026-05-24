/** Answer Engine Optimization — FAQ extraction & schema for AI/search */

export type FaqItem = { question: string; answer: string };

const FAQ_JSON_COMMENT = /<!--studymitra-faq:([\s\S]*?)-->/;

export function extractFaqFromContent(content: string): FaqItem[] {
  const commentMatch = content.match(FAQ_JSON_COMMENT);
  if (commentMatch?.[1]) {
    try {
      const parsed = JSON.parse(commentMatch[1]) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const q = String((item as FaqItem).question ?? "").trim();
            const a = String((item as FaqItem).answer ?? "").trim();
            return q && a ? { question: q, answer: a } : null;
          })
          .filter((x): x is FaqItem => x !== null);
      }
    } catch {
      // fall through to markdown parse
    }
  }

  const items: FaqItem[] = [];
  const prashnRe = /\*\*प्रश्न:\*\*\s*([^\n*]+)[\s\S]*?\*\*उत्तर:\*\*\s*([^\n*]+(?:\n(?!\*\*प्रश्न)[^\n*]+)*)/gi;
  let m: RegExpExecArray | null;
  while ((m = prashnRe.exec(content)) !== null) {
    const question = m[1]?.trim();
    const answer = m[2]?.trim();
    if (question && answer) items.push({ question, answer });
  }

  if (items.length > 0) return items.slice(0, 12);

  const enQ = /\*\*Q:\*\*\s*([^\n*]+)[\s\S]*?\*\*A:\*\*\s*([^\n*]+)/gi;
  while ((m = enQ.exec(content)) !== null) {
    const question = m[1]?.trim();
    const answer = m[2]?.trim();
    if (question && answer) items.push({ question, answer });
  }

  return items.slice(0, 12);
}

export function stripFaqComment(content: string): string {
  return content.replace(FAQ_JSON_COMMENT, "").trim();
}

export function embedFaqComment(content: string, faq: FaqItem[]): string {
  const clean = stripFaqComment(content);
  if (!faq.length) return clean;
  return `${clean}\n\n<!--studymitra-faq:${JSON.stringify(faq)}-->`;
}

export function buildFaqPageJsonLd(faqs: FaqItem[], pageUrl: string) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: pageUrl,
  };
}

export function hasDirectAnswerBlock(content: string): boolean {
  return /##\s*सीधा जवाब|##\s*Short answer|##\s*Quick answer/i.test(content);
}
