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

export const VIRAL_SEO_RULES = `
VIRAL + SEO (for Google ranking & shares):
- Title: number + benefit + year (under 70 chars)
- First 100 words must hook the reader
- Short paragraphs, H2 headings, bullet lists (Google loves scannable content)
- Natural keywords 6-10 times — never keyword stuffing
- FAQ section for featured snippets
- End with genuine value — readers should share because it HELPS them
`;
