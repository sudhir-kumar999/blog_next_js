/** Shared rules — reduces policy violations & Google API suspension risk */
export const GOOGLE_SAFE_RULES = `
GOOGLE & PLATFORM SAFETY (MANDATORY — violation = reject content):
- NO fake news, fabricated deaths, riots, or communal hate
- NO fake exam notifications, vacancy numbers, or "100% selection" claims
- NO piracy, movie download links, or copyright infringement
- NO medical cures, guaranteed weight loss, or unverified health miracles
- NO political party attacks or election propaganda
- NO adult, violent, or graphic content
- NO asking users to share X times on WhatsApp to unlock content
- NO API keys, passwords, or personal data in output
- Use "reports ke mutabik" / "official sources" when numbers are uncertain
- Be helpful, original, and factual — quality over clickbait lies
`;

export const QUALITY_SEO_RULES = `
SEO & READABILITY (helpful content — not spam):
- Clear, accurate title under 70 characters (exam + topic + year if relevant)
- Strong introduction: what the reader will learn in 2-3 sentences
- Short paragraphs, H2 headings, bullet lists and tables where useful
- Use main keywords naturally (about 2-4 times) — never keyword stuffing
- FAQ section for common student doubts
- End with a brief, honest summary — no fake urgency or guarantees
`;

/** @deprecated Use QUALITY_SEO_RULES */
export const VIRAL_SEO_RULES = QUALITY_SEO_RULES;

/** AEO — Answer Engine / AI Overviews / voice search friendly structure */
export const AEO_RULES = `
AEO (Answer Engine Optimization) — MANDATORY:
- First H2 must be "## सीधा जवाब" with 45-70 words: direct, factual answer to the main student query (no fluff).
- Use question-style H2s where natural (e.g. "SSC CGL syllabus kya hai?").
- FAQ section: minimum 6 pairs using EXACT format:
  **प्रश्न:** (clear question in Hindi)
  **उत्तर:** (2-4 helpful sentences)
- Include one comparison table OR numbered steps list for scanability.
- Mention exam name + year naturally in intro and सीधा जवाब.
- Also return "faq" JSON array (6-8 items) matching the FAQ section — same text as in content.
`;
