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

    return titles;
  } catch (err) {
    console.error("[news-headlines] fetch failed:", err);
    return [];
  }
}
