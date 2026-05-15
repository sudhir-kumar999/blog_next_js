/** Skip sensational/violent headlines — safer for Google policies & brand */
const BLOCKED_HEADLINE_PATTERNS: RegExp[] = [
  /hatya|हत्या|rape|बलात्कार|lynch|terror|आत्महत्या|suicide|murder|riot|दंगा/i,
  /graphic|gore|explicit/i,
];

/** Prefer these topics — high search, low policy risk */
const PREFERRED_HEADLINE_PATTERNS: RegExp[] = [
  /petrol|diesel|पेट्रोल|डीजल|gold|सोना|silver|चांदी|weather|मौसम|rain|बारिश/i,
  /RBI|bank|बैंक|budget|बजट|cricket|क्रिकेट|IPL|exam|परीक्षा|SSC|UPSC|railway/i,
  /price|rate|भाव|कीमत|inflation|महंगाई|scheme|योजना|PM\s|modi|India/i,
];

function filterSafeHeadlines(headlines: string[]): string[] {
  const safe = headlines.filter(
    (h) => !BLOCKED_HEADLINE_PATTERNS.some((p) => p.test(h))
  );
  const preferred = safe.filter((h) =>
    PREFERRED_HEADLINE_PATTERNS.some((p) => p.test(h))
  );
  const rest = safe.filter((h) => !preferred.includes(h));
  return [...preferred, ...rest];
}

/** Fetch latest India headlines from Google News RSS (no API key). */
export async function fetchIndiaNewsHeadlines(limit = 10): Promise<string[]> {
  try {
    const res = await fetch("https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi", {
      headers: { "User-Agent": "StudyMitraBlogBot/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const titles: string[] = [];
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

    for (const block of itemBlocks) {
      const cdata = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i);
      const plain = block.match(/<title>([^<]+)<\/title>/i);
      let title = (cdata?.[1] ?? plain?.[1] ?? "").trim();
      // Remove " - Source Name" suffix from Google News
      title = title.replace(/\s*-\s*[^-]+$/, "").trim();
      if (
        title &&
        title.length > 12 &&
        !/^Google News$/i.test(title) &&
        !titles.includes(title)
      ) {
        titles.push(title);
      }
      if (titles.length >= limit) break;
    }

    return filterSafeHeadlines(titles).slice(0, limit);
  } catch (err) {
    console.error("[news-headlines] fetch failed:", err);
    return [];
  }
}
