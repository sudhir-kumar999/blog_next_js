import { GoogleGenAI } from "@google/genai";
import { countWords, MIN_POST_WORDS } from "./wordCount";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const model = "gemini-2.5-flash";

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  content: string;
}

const PROMPT = `You are an expert blog writer for an Indian education/study blog (like Study Mitra). Your audience is students preparing for exams, competitive exams, and general learning.

Generate ONE complete blog post. Return ONLY a valid JSON object (no markdown, no code block, no extra text) with exactly these keys:
- "title": string, catchy and SEO-friendly, under 70 chars
- "slug": string, URL-friendly, lowercase, hyphens only (e.g. "how-to-study-smart-for-exams")
- "excerpt": string, 1-2 sentences for meta description, under 160 chars
- "seo_title": string, optional SEO title (can same as title)
- "seo_description": string, optional SEO description (can same as excerpt)
- "content": string, FULL article body in Markdown. MUST be at least ${MIN_POST_WORDS} words. Use headings (##, ###), short paragraphs, bullet points. Write in clear English. Topic must be trending, useful for Indian students, and 100% original (no plagiarism). Choose a topic like: study tips, exam preparation, career guidance, productivity, mental health for students, new education policy, competitive exam strategies, or similar.

Example topic ideas: "How to Focus While Studying", "Best Time to Study According to Science", "How to Prepare for Board Exams in 30 Days", "Side Hustles for College Students in India".
Pick ONE topic and write a complete, original post. Return only the JSON object.`;

function parseGeneratedJson(raw: string): GeneratedPost | null {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
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
  } catch {
    return null;
  }
}

export async function generateBlogPost(): Promise<GeneratedPost | null> {
  if (!GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: PROMPT,
  });

  const text = typeof (response as { text?: string }).text === "string"
    ? (response as { text: string }).text
    : "";
  if (!text) return null;

  const post = parseGeneratedJson(text);
  if (!post) return null;

  const words = countWords(post.content);
  if (words < MIN_POST_WORDS) return null;

  return post;
}
