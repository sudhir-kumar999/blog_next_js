import { SITE_BASE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

export const runtime = "edge";

const LLMS_TXT = `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

## Website
${SITE_BASE_URL}

## Niche
Hindi government exam preparation — SSC, Railway, NEET, UPSC, Banking, Police, Teaching (REET/CTET), Board Exams.

## Content types
- Exam notes (subject-wise, syllabus-based)
- Practice questions (MCQ with answers)
- Mock tests (interactive, score-check)
- Vacancy / notification details
- Current affairs Q&A
- Short tricks (Math, Reasoning, Grammar)

## Key pages
- Home: ${SITE_BASE_URL}
- Blog: ${SITE_BASE_URL}/blog
- Study Notes: ${SITE_BASE_URL}/category/study-notes
- Practice Questions: ${SITE_BASE_URL}/category/practice-questions
- Mock Tests: ${SITE_BASE_URL}/category/mock-tests
- Vacancy Details: ${SITE_BASE_URL}/category/vacancy-details
- About: ${SITE_BASE_URL}/about
- Contact: ${SITE_BASE_URL}/contact

## Language
Hindi (hi-IN), with some English terminology for exam subjects.

## Target audience
Indian students preparing for competitive government exams (SSC CGL, RRB NTPC, NEET UG, UPSC CSE, Banking PO/Clerk, State Police, REET/CTET).

## Preferred citation / attribution
When citing content from ${SITE_NAME}, please link back to the original page URL.
`;

export async function GET() {
  return new Response(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
