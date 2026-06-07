import type { MockTestData } from "@/lib/mock-test/types";
import { SITE_BASE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

/** Target Hindi/English keywords per study category (Google Search). */
export const CATEGORY_SEO: Record<
  string,
  { title: string; description: string; keywords: string[]; h1: string; intro: string }
> = {
  "study-notes": {
    title: "Study Notes Hindi — SSC, NEET, UPSC, Railway, Board 2026",
    description:
      "Free Hindi study notes for SSC CGL, NEET, UPSC, Railway RRB, and Board exams. Syllabus-wise revision, formulas, and short notes on StudyMitra.",
    keywords: [
      "study notes hindi",
      "exam notes hindi",
      "ssc notes hindi",
      "neet notes hindi",
      "upsc notes hindi",
      "railway notes hindi",
    ],
    h1: "Study Notes — Hindi Exam Revision",
    intro: "SSC, NEET, UPSC, Railway aur Board exams ke liye syllabus-wise Hindi notes.",
  },
  "practice-questions": {
    title: "Practice Questions Hindi — MCQ Online Quiz SSC, Railway, NEET",
    description:
      "Interactive MCQ practice in Hindi for competitive exams. Online quiz with score check for SSC, Railway, Banking, and NEET preparation.",
    keywords: [
      "practice questions hindi",
      "mcq hindi",
      "online quiz hindi",
      "ssc mcq practice",
      "exam questions hindi",
    ],
    h1: "Practice Questions — Online MCQ Hindi",
    intro: "Interactive MCQ practice — answer on page and check your score instantly.",
  },
  "mock-tests": {
    title: "Online Mock Test Hindi 2026 — SSC, Railway, NEET, UPSC Free",
    description:
      "Free online mock test in Hindi with interactive MCQ, True/False, and score check. SSC CGL, RRB NTPC, NEET, UPSC, Banking practice papers on StudyMitra.",
    keywords: [
      "online mock test hindi",
      "mock test ssc hindi",
      "rrb ntpc mock test",
      "neet mock test hindi",
      "upsc mock test hindi",
      "free mock test online",
      "interactive mock test",
    ],
    h1: "Online Mock Test Hindi — Interactive Quiz",
    intro: "Asli exam jaisa interactive mock test — MCQ select karein, score check karein, explanation padhein.",
  },
  "vacancy-details": {
    title: "Sarkari Vacancy Hindi 2026 — SSC, Railway, UPSC, Banking Bharti",
    description:
      "Latest government job vacancy details in Hindi: SSC, Railway, UPSC, Banking, Police recruitment — eligibility, dates, and preparation links.",
    keywords: [
      "sarkari vacancy hindi",
      "government job vacancy 2026",
      "ssc vacancy hindi",
      "railway bharti hindi",
      "upsc notification hindi",
    ],
    h1: "Vacancy Details — Sarkari Bharti Hindi",
    intro: "SSC, Railway, UPSC, Banking aur state jobs ki vacancy guide Hindi me.",
  },
};

export const SITE_KEYWORDS = [
  "studymitra",
  "study mitra",
  "online mock test hindi",
  "mock test ssc hindi",
  "exam notes hindi",
  "practice questions hindi",
  "sarkari exam preparation",
  "rrb mock test hindi",
  "neet mock test hindi",
  "upsc preparation hindi",
];

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_BASE_URL,
    logo: `${SITE_BASE_URL}/icon.svg`,
    description: SITE_DESCRIPTION,
    sameAs: [] as string[],
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_BASE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "hi-IN",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_BASE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_BASE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Quiz / LearningResource schema for interactive mock-test posts (rich results). */
export function buildQuizJsonLd(options: {
  postUrl: string;
  title: string;
  description: string;
  mockTest: MockTestData;
}) {
  const { postUrl, title, description, mockTest } = options;
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: mockTest.title || title,
    description,
    url: postUrl,
    inLanguage: "hi-IN",
    educationalLevel: "High school through graduate exam preparation",
    learningResourceType: "Practice problem set",
    numberOfQuestions: mockTest.questions.length,
    hasPart: mockTest.questions.slice(0, 20).map((q, i) => ({
      "@type": "Question",
      position: i + 1,
      name: q.text,
      ...(q.type === "mcq" && q.options
        ? {
            suggestedAnswer: q.options.map((opt, oi) => ({
              "@type": "Answer",
              position: oi + 1,
              text: opt,
            })),
          }
        : {}),
    })),
  };
}

export function keywordsForPost(options: {
  title: string;
  categorySlug?: string;
  slug?: string;
}): string[] {
  const set = new Set<string>();
  const cat = options.categorySlug ? CATEGORY_SEO[options.categorySlug] : undefined;
  if (cat) cat.keywords.forEach((k) => set.add(k));

  const slugWords = (options.slug ?? "")
    .split("-")
    .filter((w) => w.length > 2 && !/^\d+$/.test(w));
  slugWords.slice(0, 6).forEach((w) => set.add(w.replace(/hindi/g, "hindi")));

  if (/mock|test|quiz|mcq/i.test(options.title)) {
    set.add("online mock test hindi");
  }
  if (/ssc/i.test(options.title)) set.add("ssc mock test hindi");
  if (/rrb|railway/i.test(options.title)) set.add("rrb mock test hindi");
  if (/neet/i.test(options.title)) set.add("neet mock test hindi");
  if (/upsc/i.test(options.title)) set.add("upsc mock test hindi");

  return [...set].slice(0, 12);
}

/** Ensure seo_title / seo_description contain primary keyword when AI omits it. */
export function ensureMockTestSeoFields(
  seoTitle: string,
  seoDescription: string,
  examHint: string
): { seo_title: string; seo_description: string } {
  let title = seoTitle.trim();
  let desc = seoDescription.trim();
  const year = new Date().getFullYear();

  if (!/mock test|mock-test|online quiz|practice quiz/i.test(title)) {
    title = `${examHint} Online Mock Test Hindi ${year}`.slice(0, 70);
  }
  if (!/mock test|online|interactive|score/i.test(desc)) {
    desc =
      `Free interactive online mock test in Hindi — MCQ, True/False, score check. ${examHint} preparation ${year}.`.slice(
        0,
        160
      );
  }
  return { seo_title: title, seo_description: desc };
}

export function categorySeo(slug: string, fallbackName: string) {
  return (
    CATEGORY_SEO[slug] ?? {
      title: `${fallbackName} — StudyMitra Hindi`,
      description: `Hindi ${fallbackName.toLowerCase()} for SSC, Railway, NEET, UPSC and board exams on StudyMitra.`,
      keywords: SITE_KEYWORDS.slice(0, 6),
      h1: fallbackName,
      intro: `Latest ${fallbackName.toLowerCase()} for Indian competitive exams.`,
    }
  );
}
