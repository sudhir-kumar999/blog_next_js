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

const PROMPT = `You are an expert Hindi blog writer for an Indian education website like Study Mitra, Sarkari Result, or Result Bharat. Your audience is Indian students preparing for exams, competitive exams, and general learning.

Generate ONE complete blog post. Return ONLY a valid JSON object (no markdown block, no code block, no extra text) with exactly these keys:

- "title": string, catchy and SEO-friendly, under 70 characters
- "slug": string, URL-friendly, lowercase, hyphens only (e.g. "ssc-cgl-2026-notification")
- "excerpt": string, 1-2 sentences for meta description, under 160 characters
- "seo_title": string, optional SEO title (can be same as title)
- "seo_description": string, optional SEO description (can be same as excerpt)
- "content": string, FULL article body in Markdown

CONTENT RULES:
- Write in simple Hindi (Devanagari script)
- Content MUST be at least ${MIN_POST_WORDS} words
- Use clear headings (##, ###), short paragraphs, and bullet points
- SEO optimized (use keywords like: Sarkari Naukri, Admit Card, Result, Notes, Questions, Exam Preparation)
- 100% original content (no plagiarism)
- Use latest year references like 2025 or 2026 when relevant
- Make content engaging and easy to understand for students

TOPIC SELECTION:
Automatically choose ONE trending topic from:
1. Sarkari Job Notification
2. Admit Card Update
3. Result Update
4. Admission Form
5. Study Notes (any subject)
6. Important Questions with Answers
7. Exam Preparation Tips
8. Career Guidance

CONTENT STRUCTURE BASED ON TOPIC:

👉 If topic is Job / Admit Card / Result / Admission:
- Introduction
- Important Dates
- Application Fee
- Age Limit
- Vacancy Details
- Selection Process
- How to Apply
- Important Links

👉 If topic is Notes:
- Introduction
- Definition
- Key Concepts
- Examples
- Summary

👉 If topic is Questions:
- Introduction
- Important Questions with Answers
- Short Tricks (if possible)

👉 If topic is Tips / Career:
- Introduction
- Step-by-step guidance
- Tips
- Conclusion

SLUG RULE:
- Convert title into lowercase
- Replace spaces with hyphens
- Remove special characters

IMPORTANT:
- Do NOT include anything except JSON
- Do NOT wrap response in markdown or code block
- Ensure JSON is valid and parsable

Now generate the blog post.`;

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
