import { GoogleGenAI } from "@google/genai";
import { GOOGLE_SAFE_RULES, VIRAL_SEO_RULES } from "./google-safe-prompt";
import { fetchIndiaNewsHeadlines } from "./news-headlines";
import { enrichPostForSeo, validatePostQuality, type PostQualityFailure } from "./post-quality";
import { countWords, MIN_POST_WORDS } from "./wordCount";

// One model = fewer API calls (helps avoid quota suspension). Set GEMINI_FALLBACK_MODEL for backup.
const DEFAULT_MODELS = ["gemini-2.5-flash"] as const;
const MAX_OUTPUT_TOKENS = 16384;
const MAX_GENERATION_ATTEMPTS = 2;

function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

export function getGeminiKeyFingerprint(): string | null {
  const key = getGeminiApiKey();
  if (!key) return null;
  return key.slice(-4);
}

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  content: string;
}

export type GenerateBlogPostFailure =
  | { kind: "missing_api_key" }
  | { kind: "project_suspended"; projectId?: string }
  | { kind: "quota_exceeded" }
  | { kind: "api_error"; status?: number; message: string }
  | { kind: "empty_model_text" }
  | { kind: "truncated_response" }
  | { kind: "json_parse_failed"; preview: string }
  | { kind: "too_short"; words: number; minWords: number }
  | { kind: "content_blocked"; reason: string };

function getGeminiModels(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim();
  const models: string[] = [];
  if (fromEnv) models.push(fromEnv);
  else models.push(...DEFAULT_MODELS);
  if (fallback && !models.includes(fallback)) models.push(fallback);
  else if (!fromEnv) {
    const extra = DEFAULT_MODELS.filter((m) => !models.includes(m));
    models.push(...extra);
  }
  return models;
}

function isRetryableFailure(failure: GenerateBlogPostFailure): boolean {
  return (
    failure.kind === "json_parse_failed" ||
    failure.kind === "truncated_response" ||
    failure.kind === "too_short"
  );
}

function parseGeminiApiError(err: unknown): GenerateBlogPostFailure {
  const raw = err instanceof Error ? err.message : String(err);
  const sanitized = raw
    .replace(/api_key:[A-Za-z0-9_-]+/gi, "api_key:[REDACTED]")
    .replace(/AIza[A-Za-z0-9_-]+/g, "[REDACTED_KEY]");

  const projectMatch = sanitized.match(/projects\/(\d+)/);
  const projectId = projectMatch?.[1];

  if (/CONSUMER_SUSPENDED|has been suspended/i.test(sanitized)) {
    return {
      kind: "project_suspended",
      projectId,
    };
  }

  if (
    /RESOURCE_EXHAUSTED|quota exceeded|rate limit|429|too many requests/i.test(sanitized)
  ) {
    return { kind: "quota_exceeded" };
  }

  let status: number | undefined;
  const statusMatch = sanitized.match(/"code":\s*(\d{3})/);
  if (statusMatch) status = Number(statusMatch[1]);

  const messageMatch = sanitized.match(/"message":\s*"([^"]+)"/);
  const apiMessage = messageMatch?.[1];

  if (status === 429) {
    return { kind: "quota_exceeded" };
  }

  if (status === 404 || /is not found for API version/i.test(sanitized)) {
    return {
      kind: "api_error",
      status: 404,
      message: apiMessage ?? "Gemini model not found — will try next model",
    };
  }

  return {
    kind: "api_error",
    status,
    message: apiMessage ?? (sanitized.slice(0, 400) || "Gemini API request failed"),
  };
}

function isModelNotFoundFailure(failure: GenerateBlogPostFailure): boolean {
  return failure.kind === "api_error" && failure.status === 404;
}

export async function testGeminiConnection(): Promise<
  | { ok: true; model: string; keySuffix: string }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false, failure: { kind: "missing_api_key" } };

  const ai = new GoogleGenAI({ apiKey });
  for (const model of getGeminiModels()) {
    try {
      await ai.models.generateContent({
        model,
        contents: "Reply with exactly: ok",
        config: { maxOutputTokens: 16 },
      });
      return { ok: true, model, keySuffix: apiKey.slice(-4) };
    } catch (err) {
      const failure = parseGeminiApiError(err);
      if (failure.kind === "project_suspended") {
        return { ok: false, failure };
      }
      // Try next model on 404 (model name not available for this API key).
      if (!isModelNotFoundFailure(failure)) {
        return { ok: false, failure };
      }
    }
  }

  return {
    ok: false,
    failure: {
      kind: "api_error",
      message:
        "No Gemini model worked. Set GEMINI_MODEL=gemini-2.5-flash in Vercel and redeploy.",
    },
  };
}

type TopicSeed = {
  category: string;
  keywords: string;
  hint: string;
  viralAngle: string;
};

type TopicType = "study" | "general" | "gk" | "news";

/** 0 = morning (latest news), 1 = evening (study/general/gk) */
export type PostSlot = 0 | 1;

type ResolvedTopic = TopicSeed & { isTrending: boolean; topicType: TopicType; headlines?: string[] };

/** Exam & career — high search among students */
const TRENDING_STUDY_TOPICS: TopicSeed[] = [
  {
    category: "SSC CGL 2026 — पूरी तैयारी गाइड और सिलेबस",
    keywords: "SSC CGL 2026, SSC CGL syllabus, SSC preparation Hindi, SSC CGL strategy",
    hint: "Notification, tier pattern, subject-wise plan, books, 90-day roadmap",
    viralAngle: "Urgency + numbers: '90 दिन में SSC CGL कैसे क्रैक करें' style hook",
  },
  {
    category: "NEET UG 2026 — रैंक बढ़ाने के टॉप स्ट्रैटेजी",
    keywords: "NEET 2026 preparation, NEET strategy Hindi, NEET biology tips, NEET rank",
    hint: "NCERT focus, mock tests, weak chapters, last 3 months plan",
    viralAngle: "Fear + hope: common mistakes vs toppers' secret routine",
  },
  {
    category: "UPSC 2026 — बिगिनर्स के लिए पूरा रोडमैप",
    keywords: "UPSC 2026 preparation, UPSC strategy Hindi, IAS preparation, UPSC syllabus",
    hint: "Prelims, Mains, optional, daily timetable, free resources",
    viralAngle: "Aspirational: 'बिना कोचिंग UPSC की तैयारी कैसे शुरू करें'",
  },
  {
    category: "Railway RRB NTPC / Group D 2026 — एग्जाम गाइड",
    keywords: "Railway exam 2026, RRB NTPC preparation, Railway GK Hindi, RRB syllabus",
    hint: "Exam pattern, GK, math, reasoning, previous year trends",
    viralAngle: "Job urgency: salary, vacancy buzz, 'last minute revision' checklist",
  },
  {
    category: "Board Exam 2026 — 30 दिन में 90%+ स्कोर कैसे",
    keywords: "Board exam 2026 tips, 10th 12th exam preparation, board exam strategy Hindi",
    hint: "Time table, sample papers, stress control, subject-wise hacks",
    viralAngle: "Parent + student shareable: result guarantee framing (realistic, not false)",
  },
  {
    category: "AI से पढ़ाई — 2026 के बेस्ट फ्री टूल्स विद्यार्थियों के लिए",
    keywords: "AI study tools Hindi, ChatGPT for students, free AI education India",
    hint: "Note making, quiz, revision, ethics, which tools are actually free",
    viralAngle: "Tech trend: 'ये 5 AI टूल्स आपकी पढ़ाई 2 घंटे में कर देंगे'",
  },
  {
    category: "सरकारी योजनाएं 2026 — छात्रों के लिए स्कॉलरशिप और फ्री कोचिंग",
    keywords: "scholarship 2026 India, government scheme students, free coaching scheme",
    hint: "PM schemes, state scholarships, eligibility, apply steps, deadlines",
    viralAngle: "Money hook: 'मुफ्त में मिलने वाली स्कॉलरशिप' — highly shareable on WhatsApp",
  },
  {
    category: "करंट अफेयर्स मई 2026 — परीक्षा में आने वाले TOP 50 प्रश्न",
    keywords: "current affairs May 2026 Hindi, monthly current affairs, GK 2026",
    hint: "National, international, sports, awards, schemes — exam-focused only",
    viralAngle: "Listicle: numbered facts students can screenshot and share",
  },
  {
    category: "REET / CTET / TET 2026 — टीचर एग्जाम क्रैक गाइड",
    keywords: "REET 2026, CTET preparation Hindi, TET exam strategy, teacher exam",
    hint: "Child development, pedagogy, Hindi, EVS, mock strategy",
    viralAngle: "Stable job angle + cut-off prediction style (educated guess, not fake news)",
  },
  {
    category: "Banking Exam 2026 — SBI / IBPS PO Clerk पूरी तैयारी",
    keywords: "bank exam 2026, IBPS PO preparation, SBI clerk Hindi, banking exam strategy",
    hint: "Quant, reasoning, English, GA, interview tips",
    viralAngle: "Salary + work-life balance — why lakhs apply every year",
  },
  {
    category: "वन रैंक / टॉपर स्टडी रूटीन — 12 घंटे पढ़ाई बिना थकान",
    keywords: "study routine Hindi, topper study schedule, productive study tips",
    hint: "Pomodoro, sleep, phone detox, weekly planner template",
    viralAngle: "Instagram/Reels style: 'टॉपर्स ये 7 गलतियां कभी नहीं करते'",
  },
  {
    category: "Defence Exam 2026 — NDA / CDS / AFCAT गाइड",
    keywords: "NDA 2026 preparation, CDS exam Hindi, AFCAT strategy, defence exam",
    hint: "Math, GAT, English, SSB basics overview, physical fitness",
    viralAngle: "Patriotic + career prestige — dream job framing",
  },
  {
    category: "Budget 2026 — छात्रों और युवाओं पर क्या असर",
    keywords: "budget 2026 India students, budget highlights Hindi, education budget",
    hint: "Education allocation, jobs, schemes, tax, startups for youth",
    viralAngle: "Breaking news style — '5 चीजें जो आपको जाननी जरूरी हैं'",
  },
  {
    category: "Police / State SI / Constable 2026 — एग्जाम की पूरी तैयारी",
    keywords: "police exam 2026 Hindi, SI exam preparation, constable exam strategy",
    hint: "GK, Hindi, math, reasoning, physical test overview",
    viralAngle: "Local pride + job security — state-wise exam buzz",
  },
  {
    category: "JEE Main 2026 — रैंक सुधारने के प्रूवन टिप्स",
    keywords: "JEE Main 2026 preparation, JEE strategy Hindi, IIT preparation tips",
    hint: "Physics, chemistry, math priority chapters, mock analysis",
    viralAngle: "Competitive pressure + 'last 60 days' emergency plan",
  },
];

/** Padhai ke alawa — viral general topics (WhatsApp / Reels / Google Trends style) */
const GENERAL_VIRAL_TOPICS: TopicSeed[] = [
  {
    category: "फोन की बैटरी 2 दिन चले — 10 सेटिंग्स जो कोई नहीं बताता",
    keywords: "phone battery tips Hindi, mobile battery save, smartphone tricks India",
    hint: "Brightness, background apps, charging myths, Android/iPhone both",
    viralAngle: "Tech hack listicle — parents + students dono share karte hain",
  },
  {
    category: "UPI स्कैम से बचें — 2026 में ये 7 तरीके इस्तेमाल हो रहे हैं",
    keywords: "UPI scam Hindi, online fraud India, digital safety tips",
    hint: "Fake calls, QR fraud, OTP trap, what to do if cheated",
    viralAngle: "Fear + safety — har family group mein forward hota hai",
  },
  {
    category: "घर पर वजन कम करें — बिना जिम 30 दिन प्लान (साइंस बेस्ड)",
    keywords: "weight loss tips Hindi, fat loss home, healthy lifestyle India",
    hint: "Diet myths, walking, sleep, sugar, realistic expectations — no magic pills",
    viralAngle: "Before/after hope — summer body trend",
  },
  {
    category: "नींद नहीं आती? — रात को फोन छोड़ने के 5 प्रूवन तरीके",
    keywords: "sleep tips Hindi, insomnia solution, phone addiction night",
    hint: "Melatonin habits, screen time, routine, students & working youth",
    viralAngle: "Relatable pain — '2 बजे तक रील्स' generation",
  },
  {
    category: "पैसे बचाएं — महीने में ₹5000 बचाने के 12 आसान तरीके",
    keywords: "money saving tips Hindi, budget India, paisa bachao",
    hint: "Subscriptions, food delivery, EMI trap, small habits compound",
    viralAngle: "Money emoji hook — youth aur parents dono audience",
  },
  {
    category: "भारत के 10 सबसे सुंदर घूमने की जगह — कम बजट में",
    keywords: "budget travel India Hindi, best places visit India, ghumne ki jagah",
    hint: "North-East, Rajasthan, Kerala, hills — cost estimate, best season",
    viralAngle: "Wanderlust photos in mind — share with friends 'chalte hain'",
  },
  {
    category: "IPL / क्रिकेट 2026 — फैन गाइड और रिकॉर्ड्स जो हर कोई पूछता है",
    keywords: "IPL 2026 Hindi, cricket facts India, sports GK viral",
    hint: "Teams, rules basics, famous records, fantasy tips (legal fun only)",
    viralAngle: "Cricket fever — match day traffic spike",
  },
  {
    category: "OTT पर क्या देखें — इस महीने की TOP 10 वेब सीरीज़ और फिल्में",
    keywords: "best web series Hindi 2026, Netflix Prime India, movie list",
    hint: "Genre mix: thriller, comedy, motivational — no piracy links",
    viralAngle: "Weekend binge list — 'kya dekhu?' most searched",
  },
  {
    category: "सरकारी योजनाएं — आम इंडियन के लिए मुफ्त लाभ (पूरी लिस्ट)",
    keywords: "sarkari yojana 2026 Hindi, government scheme India, PM Yojana list",
    hint: "Health, insurance, pension, women, farmers — eligibility simple Hindi",
    viralAngle: "Free money/scheme hook — WhatsApp viral king",
  },
  {
    category: "English बोलना सीखें — 30 दिन में शर्म छोड़ें (डेली 15 मिनट)",
    keywords: "English speaking Hindi, learn English free, spoken English tips",
    hint: "Daily practice, common phrases, mistakes Indians make, confidence",
    viralAngle: "Career + impress — job interview angle bhi",
  },
  {
    category: "मानसिक तनाव / Anxiety — घर पर खुद को कैसे संभालें",
    keywords: "mental health Hindi, stress relief students, anxiety tips India",
    hint: "Breathing, talk to someone, exam stress, when to seek doctor — sensitive tone",
    viralAngle: "Emotional share — 'kisi ko bhejo jo zarurat ho'",
  },
  {
    category: "घर पर कमाई — Students के लिए ऑनलाइन कमाने के सच्चे तरीके 2026",
    keywords: "online earning students Hindi, part time job online, freelancing India",
    hint: "Content writing, design, tutoring, scams to avoid, realistic income",
    viralAngle: "Side income dream — 'phone se kamai' trend",
  },
  {
    category: "गर्मी में कूल रहें — Heatwave से बचाव की पूरी गाइड",
    keywords: "heatwave tips Hindi, summer health India, garmi se bachav",
    hint: "Hydration, ORS, clothes, outdoor timing, elderly & kids",
    viralAngle: "Seasonal urgent — news jaisa feel",
  },
  {
    category: "रिश्ते और दोस्ती — Toxic लोगों को पहचानें (Youth गाइड)",
    keywords: "toxic relationship signs Hindi, friendship advice, life tips youth",
    hint: "Red flags, boundaries, self respect — mature but simple Hindi",
    viralAngle: "Drama + self love — Instagram quote energy",
  },
  {
    category: "सोशल मीडिया पर वायरल होने के 8 नियम — Reels / Shorts 2026",
    keywords: "viral reels tips Hindi, YouTube shorts India, content creator guide",
    hint: "Hook first 3 sec, trends, consistency, niche, no copyright music warning",
    viralAngle: "Creator economy — lakhs want to be influencer",
  },
  {
    category: "सोना-चांदी / SIP — निवेश की शुरुआत बिना झंझट (बिगिनर्स)",
    keywords: "SIP investment Hindi, gold silver India, paise kaise lagaye",
    hint: "Risk, mutual fund basics, scams, long term — not financial advice disclaimer",
    viralAngle: "Money grow FOMO — youth first salary wale",
  },
  {
    category: "भारतीय त्योहार — इस सीजन में महत्व, रीति और दिलचस्प तथ्य",
    keywords: "Indian festival Hindi, tyohar 2026, festival facts India",
    hint: "Pick festival near current month, history, celebration, regional diversity",
    viralAngle: "Emotional + cultural pride — family share",
  },
  {
    category: "घरेलू नुस्खे vs डॉक्टर — क्या सच में काम करता है?",
    keywords: "gharelu nuskhe Hindi, health myths India, desi totkay science",
    hint: "Haldi, ginger, honey — evidence based, when NOT to skip doctor",
    viralAngle: "Myth busting — 'sach ya jhooth' curiosity",
  },
  {
    category: "पानी पीने के फायदे — 90% लोग ये गलतियां करते हैं",
    keywords: "drink water benefits Hindi, hydration health, wellness tips",
    hint: "How much water, timing myths, skin, energy, kidney basics",
    viralAngle: "Simple health — everyone thinks they know but don't",
  },
  {
    category: "AI और रोज़मर्रा की ज़िंदगी — ChatGPT से क्या-क्या कर सकते हैं (नॉन-टेक)",
    keywords: "ChatGPT uses Hindi, AI daily life India, AI tips common man",
    hint: "Email, resume, cooking, travel plan, limits & privacy — not just study",
    viralAngle: "AI hype — non-tech audience massive",
  },
];

const COMPETITION_TOPICS: TopicSeed[] = [
  {
    category: "सामान्य ज्ञान - भारतीय इतिहास",
    keywords: "Indian History GK, भारतीय इतिहास प्रश्न उत्तर, SSC History MCQ",
    hint: "Mughal Empire, Freedom Movement, Ancient India",
    viralAngle: "Surprising facts students don't know — shareable history hooks",
  },
  {
    category: "सामान्य ज्ञान - भारतीय संविधान और राजव्यवस्था",
    keywords: "Polity GK Hindi, संविधान प्रश्न उत्तर, UPSC Polity MCQ",
    hint: "Fundamental Rights, Parliament, President, Courts",
    viralAngle: "Exam traps: articles students always confuse",
  },
  {
    category: "करंट अफेयर्स — इस महीने परीक्षा में पूछे जाने वाले TOP प्रश्न",
    keywords: "Current Affairs Hindi 2026, करंट अफेयर्स प्रश्न, Monthly GK",
    hint: "Awards, sports, schemes, appointments — only exam-relevant",
    viralAngle: "Monthly roundup listicle — high search volume",
  },
  {
    category: "गणित शॉर्ट ट्रिक्स — SSC/Railway के लिए",
    keywords: "Math Tricks Hindi, गणित शॉर्ट ट्रिक्स, SSC Math Shortcuts",
    hint: "Percentage, ratio, SI/CI, speed-time, profit-loss",
    viralAngle: "One trick that solves 10 question types — reel-friendly",
  },
];

function getCurrentYearMonth(): { year: number; month: string } {
  const today = new Date();
  const year = today.getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return { year, month: months[today.getMonth()] ?? "May" };
}

/** News themes when RSS is empty — still written as "latest" explainers */
const NEWS_FALLBACK_THEMES: TopicSeed[] = [
  {
    category: "पेट्रोल-डीजल की कीमतें — आज क्या दर है और क्यों बढ़ती हैं",
    keywords: "petrol price today India Hindi, diesel rate, fuel price news",
    hint: "City-wise rates concept, crude oil link, budget impact, save fuel tips",
    viralAngle: "Har driver family group mein share — paisa bachao angle",
  },
  {
    category: "सोने-चांदी के भाव — आज का रेट और भारतीयों पर असर",
    keywords: "gold price today Hindi, silver rate India, sone ka bhav",
    hint: "Why rates move, wedding season, investment basics",
    viralAngle: "Gold = emotional + money hook",
  },
  {
    category: "मौसम / बारिश / गर्मी — भारत में अलर्ट और तैयारी",
    keywords: "weather alert India Hindi, heatwave rain news, IMD update",
    hint: "Safety, travel, health, state-wise impact",
    viralAngle: "Urgent seasonal news everyone checks",
  },
  {
    category: "RBI / बैंक / EMI — आम लोगों के लिए क्या बदला",
    keywords: "RBI news Hindi, repo rate, loan EMI India, bank news",
    hint: "Interest rates, loans, savings — simple Hindi",
    viralAngle: "EMI = instant attention for youth & parents",
  },
];

async function resolveNewsTopic(slot: PostSlot): Promise<ResolvedTopic> {
  const headlines = await fetchIndiaNewsHeadlines(12);
  const { year, month } = getCurrentYearMonth();
  const today = new Date();
  const pick = (today.getDate() + slot) % Math.max(headlines.length, 1);

  if (headlines.length > 0) {
    const lead = headlines[pick] ?? headlines[0];
    return {
      category: `ब्रेकिंग न्यूज़: ${lead}`,
      keywords: `breaking news Hindi, latest news India ${year}, taza khabar, ${lead.slice(0, 50)}`,
      hint: `REAL headlines from India today (${month} ${year}). Primary story: "${lead}". Also reference if relevant: ${headlines.slice(0, 6).join(" | ")}. Cover: kya hua, kyun important, common man impact, students/exam GK angle.`,
      viralAngle: "News channel style — 'Abhi ki badi khabar' — share on WhatsApp",
      isTrending: true,
      topicType: "news",
      headlines,
    };
  }

  const fallback = NEWS_FALLBACK_THEMES[today.getDate() % NEWS_FALLBACK_THEMES.length];
  return {
    ...fallback,
    isTrending: true,
    topicType: "news",
    hint: `${fallback.hint}. Write as ${month} ${year} latest update style using your best knowledge of current India trends (fuel, inflation, weather, major govt news). Say "sources ke mutabik" — do NOT invent exact fake prices.`,
  };
}

function getTodaysTopic(slot: PostSlot): ResolvedTopic {
  const today = new Date();
  const dateSeed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate() +
    slot * 997;

  const roll = dateSeed % 10;
  let pool: TopicSeed[];
  let topicType: TopicType;

  if (roll <= 4) {
    pool = TRENDING_STUDY_TOPICS;
    topicType = "study";
  } else if (roll <= 8) {
    pool = GENERAL_VIRAL_TOPICS;
    topicType = "general";
  } else {
    pool = COMPETITION_TOPICS;
    topicType = "gk";
  }

  const primaryIndex = dateSeed % pool.length;
  const randomOffset = Math.floor(Math.random() * 2);
  const finalIndex = (primaryIndex + randomOffset) % pool.length;

  return {
    ...pool[finalIndex],
    isTrending: topicType !== "gk",
    topicType,
  };
}

async function resolveTopic(slot: PostSlot): Promise<ResolvedTopic> {
  if (slot === 0) return resolveNewsTopic(slot);
  return getTodaysTopic(slot);
}

export function parsePostSlot(req: Request): PostSlot {
  const url = new URL(req.url);
  const p = url.searchParams.get("slot");
  if (p === "1" || p === "evening") return 1;
  if (p === "0" || p === "morning" || p === "news") return 0;
  const hour = new Date().getUTCHours();
  return hour < 12 ? 0 : 1;
}

function buildContentStructure(
  topicType: TopicType,
  mcqCount: number,
  factCount: number
): string {
  if (topicType === "news") {
    const quizCount = Math.min(mcqCount, 8);
    return `
CONTENT STRUCTURE (breaking news blog — use these ## headings):

## 🚨 ब्रेकिंग: मुख्य खबर क्या है?
2-4 lines — jaise TV news opener. Date mention karo.

## 📌 60 सेकंड में पूरी खबर (Bullet Timeline)
6-8 bullets — kya, kab, kahan, kiske liye important.

## 🔍 पूरी कहानी — आसान हिंदी में
Detail: background, kyun charcha mein hai, official sources ke saath (generic "reports ke mutabik").

## 💰 आम भारतीय / छात्रों पर क्या असर?
Petrol, kharcha, exam, job, travel — practical impact.

## 📊 नंबर्स और तुलना (अगर rate/price/policy ho)
Table ya bullets — pehle vs ab jaisa format (approx OK, fake exact dates mat banao).

## 🎯 परीक्षा GK: ${quizCount} सवाल इस खबर से
News-based MCQs (SSC/Railway/UPSC style):
**Q1.** (A)(B)(C)(D) ✅ **उत्तर: (X)** 💡 **व्याख्या:**

## 💬 लोग पूछ रहे हैं (FAQ)
4-5 real doubts — "kya sach hai?", "mujhe kya karna chahiye?"

## 📲 ताज़ा खबर शेयर करें
WhatsApp family group CTA + Study Mitra.

## निष्कर्ष
2 lines — calm, factual, no panic.`;
  }

  if (topicType === "general") {
    const quizCount = Math.min(mcqCount, 8);
    return `
CONTENT STRUCTURE (use these exact ## headings in "content"):

## 🔥 आज ये क्यों वायरल है? (Hook — 3-4 lines)
Relatable problem — har umar ke Indian youth ko lage "ye mere liye hai".

## 📌 30 सेकंड में मुख्य बातें
6-8 bullet points — WhatsApp forward style.

## 📖 पूरी जानकारी (Main Story)
Deep, entertaining, useful — stories, examples, tables/lists.

## ⚠️ सच vs झूठ / गलतफहमियां
3-5 myths busted — sabse zyada share hone wala section.

## 🧠 ${quizCount} सवाल — क्या आप सही जवाब दे पाएंगे?
Fun quiz (NOT exam): **Q1.** (A)(B)(C)(D) ✅ **जवाब: (X)** 💡 **क्यों:**

## 💡 ${factCount} चौंकाने वाले फैक्ट्स
Numbered 1-${factCount}.

## 💬 लोग ये भी पूछते हैं (FAQ)
4-5 Q&A pairs.

## 📲 दोस्तों को भेजें
Family group forward CTA + Study Mitra.

## निष्कर्ष
2-3 lines — positive, actionable.`;
  }

  return `
CONTENT STRUCTURE (use these exact ## headings in "content"):

## 🔥 आज क्यों पढ़ें?
Hook + exam relevance (SSC/Railway/UPSC/Bank).

## 📌 मुख्य बातें
5-7 bullet points.

## 📚 पूरी गाइड
Tables, steps, timelines.

## ❓ ${mcqCount} महत्वपूर्ण MCQ
Exam-style: **Q1.** (A)(B)(C)(D) ✅ **उत्तर: (X)** 💡 **व्याख्या:**

## ⚡ शॉर्ट ट्रिक्स
Memory hacks, exam traps.

## 🎯 ${factCount} परीक्षा फैक्ट्स
Numbered 1-${factCount}.

## 💬 FAQ
4-5 Q&A.

## 📲 शेयर करें
WhatsApp CTA + Study Mitra.

## निष्कर्ष
2-3 lines.`;
}

async function buildPrompt(compact = false, slot: PostSlot = 0): Promise<string> {
  const topic = await resolveTopic(slot);
  const { year, month } = getCurrentYearMonth();
  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const mcqCount = compact ? 10 : 12;
  const factCount = compact ? 8 : 10;
  const isGeneral = topic.topicType === "general";
  const isNews = topic.topicType === "news";

  const writerRole = isNews
    ? `breaking news Hindi journalist for Study Mitra — Aaj Tak + BBC Hindi style but simple. Write TODAY's India news that people search on Google (petrol rate, gold price, weather, RBI, major national news). Factual, fast, shareable.`
    : isGeneral
      ? `viral Hindi lifestyle blogger for Study Mitra. Audience: Indians 16-35. MASS WhatsApp shares.`
      : `viral Hindi education writer for Study Mitra — Unacademy + Sarkari Result style.`;

  const titleExamples = isNews
    ? `"पेट्रोल की कीमत आज: शहरों में कितनी दर?" / "ब्रेकिंग: [खबर] — पूरी जानकारी हिंदी में"`
    : isGeneral
      ? `"UPI स्कैम: 7 नए तरीके" / "फोन बैटरी 2 दिन: 10 सेटिंग्स"`
      : `"SSC CGL 2026: 90 दिन रणनीति" / "NEET 2026: 5 गलतियां"`;

  const postTypeLabel = isNews
    ? "LATEST NEWS (aaj ki taza khabar — petrol, sone ka bhav, weather, RBI, breaking India)"
    : isGeneral
      ? "GENERAL VIRAL"
      : topic.topicType === "study"
        ? "STUDY TRENDING"
        : "GK EVERGREEN";

  const headlinesBlock =
    isNews && topic.headlines?.length
      ? `\nTODAY'S REAL HEADLINES (pick primary story from these — do NOT ignore):\n${topic.headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n`
      : "";

  return `You are a ${writerRole}

Today: ${month} ${year}, slot: ${slot === 0 ? "MORNING NEWS POST" : "EVENING POST"}.
Return ONLY valid JSON: title, slug, excerpt, seo_title, seo_description, content.
${headlinesBlock}
TITLE: Under 70 chars | Breaking news style if news | Examples: ${titleExamples}
Viral angle: ${topic.viralAngle}
Type: ${postTypeLabel}

TOPIC: ${topic.category}
Focus: ${topic.hint}
Keywords (6-10x): ${topic.keywords}

RULES: Hindi (Devanagari) | Min ${minWords} words | Share-worthy
${isNews ? "NEWS: Factual only. Say 'reports ke mutabik' for uncertain numbers. Include today's date." : isGeneral ? "Helpful lifestyle content only." : "Exam-useful. No fake vacancies."}

${GOOGLE_SAFE_RULES}
${VIRAL_SEO_RULES}

${buildContentStructure(topic.topicType, mcqCount, factCount)}

SLUG: English, lowercase, hyphens, include news keyword (e.g. petrol-price-today-india-hindi-2026).
Return COMPLETE JSON only — never truncate.`;
}

function extractFinishReason(response: unknown): string | undefined {
  try {
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      !!v && typeof v === "object" && !Array.isArray(v);
    const root = isRecord(response) ? response : undefined;
    const candidates = root?.candidates;
    if (!Array.isArray(candidates) || !candidates[0]) return undefined;
    const first = candidates[0];
    if (!isRecord(first)) return undefined;
    const reason = first.finishReason ?? first.finish_reason;
    return typeof reason === "string" ? reason : undefined;
  } catch {
    return undefined;
  }
}

function isTruncatedResponse(response: unknown, text: string): boolean {
  const reason = extractFinishReason(response);
  if (reason === "MAX_TOKENS" || reason === "max_tokens") return true;
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return false;
  if (trimmed.endsWith("}")) return false;
  return true;
}

function extractModelText(response: unknown): string {
  // The @google/genai SDK response shape differs across versions/paths.
  // We defensively extract the first plausible text we can find.
  try {
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      !!v && typeof v === "object" && !Array.isArray(v);
    const getRecord = (obj: unknown, key: string): Record<string, unknown> | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return isRecord(val) ? val : undefined;
    };
    const getString = (obj: unknown, key: string): string | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return typeof val === "string" ? val : undefined;
    };
    const getFn = (obj: unknown, key: string): ((...args: unknown[]) => unknown) | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return typeof val === "function" ? (val as (...args: unknown[]) => unknown) : undefined;
    };
    const getArray = (obj: unknown, key: string): unknown[] | undefined => {
      if (!isRecord(obj)) return undefined;
      const val = obj[key];
      return Array.isArray(val) ? val : undefined;
    };

    const directText = getString(response, "text");
    if (directText?.trim()) return directText.trim();

    const textFn = getFn(response, "text");
    if (textFn) {
      const t = textFn();
      if (typeof t === "string" && t.trim()) return t.trim();
    }

    const innerResponse = getRecord(response, "response");
    if (innerResponse) {
      const innerTextFn = getFn(innerResponse, "text");
      if (innerTextFn) {
        const t = innerTextFn();
        if (typeof t === "string" && t.trim()) return t.trim();
      }
      const innerText = getString(innerResponse, "text");
      if (innerText?.trim()) return innerText.trim();
    }

    const extractFromCandidates = (root: unknown): string => {
      const candidates = getArray(root, "candidates");
      const first = candidates?.[0];
      const content = getRecord(first, "content");
      const parts = getArray(content, "parts");
      const joined =
        parts
          ?.map((p) => {
            const t = getString(p, "text");
            return typeof t === "string" ? t : "";
          })
          .join("") ?? "";
      return joined;
    };

    const candidateText = extractFromCandidates(response);
    if (candidateText.trim()) return candidateText.trim();

    const nestedCandidateText = extractFromCandidates(innerResponse);
    if (nestedCandidateText.trim()) return nestedCandidateText.trim();
  } catch {
    // ignore
  }
  return "";
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  // 1) Direct parse
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }

  // 2) If the model added extra prose, try the first {...} block.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      // ignore
    }
  }

  return null;
}

function parseGeneratedJson(raw: string): GeneratedPost | null {
  let text = raw.trim();
  // Strip markdown code fences if the model wraps JSON in ```json ...```.
  // Sometimes the closing fence is missing in truncated outputs, so handle both cases.
  if (text.startsWith("```")) {
    // Remove the opening fence line: ``` or ```json
    const firstNewline = text.indexOf("\n");
    if (firstNewline >= 0) text = text.slice(firstNewline + 1).trim();
    // Remove a trailing closing fence if present
    const lastFence = text.lastIndexOf("```");
    if (lastFence >= 0) text = text.slice(0, lastFence).trim();
  } else {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) text = codeBlock[1].trim();
  }
  const parsed = tryParseJsonObject(text);
  if (!parsed) return null;

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
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  compact: boolean,
  slot: PostSlot
): Promise<Awaited<ReturnType<typeof ai.models.generateContent>>> {
  return ai.models.generateContent({
    model,
    contents: await buildPrompt(compact, slot),
    config: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.6,
      topP: 0.95,
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        additionalProperties: false,
        required: ["title", "slug", "excerpt", "seo_title", "seo_description", "content"],
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          excerpt: { type: "string" },
          seo_title: { type: "string" },
          seo_description: { type: "string" },
          content: { type: "string" },
        },
      },
    },
  });
}

async function attemptGenerate(
  apiKey: string,
  compact: boolean,
  slot: PostSlot
): Promise<
  | { ok: true; post: GeneratedPost }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const ai = new GoogleGenAI({ apiKey });
  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
  let lastApiFailure: GenerateBlogPostFailure | null = null;

  for (const model of getGeminiModels()) {
    try {
      response = await generateWithModel(ai, model, compact, slot);
      break;
    } catch (err) {
      lastApiFailure = parseGeminiApiError(err);
      console.error(`[gemini] model ${model} failed:`, lastApiFailure);
      if (
        lastApiFailure.kind === "project_suspended" ||
        lastApiFailure.kind === "quota_exceeded"
      ) {
        return { ok: false, failure: lastApiFailure };
      }
      if (!isModelNotFoundFailure(lastApiFailure)) {
        return { ok: false, failure: lastApiFailure };
      }
    }
  }

  if (!response) {
    return {
      ok: false,
      failure: lastApiFailure ?? {
        kind: "api_error",
        message: "Gemini API request failed. Set GEMINI_MODEL=gemini-2.5-flash in Vercel.",
      },
    };
  }

  const finishReason = extractFinishReason(response);
  if (finishReason === "SAFETY" || finishReason === "RECITATION") {
    return {
      ok: false,
      failure: { kind: "content_blocked", reason: `Model blocked output: ${finishReason}` },
    };
  }

  const text = extractModelText(response);
  if (!text) return { ok: false, failure: { kind: "empty_model_text" } };

  if (isTruncatedResponse(response, text)) {
    console.error("[gemini] response truncated (MAX_TOKENS or incomplete JSON)");
    return { ok: false, failure: { kind: "truncated_response" } };
  }

  const post = parseGeneratedJson(text);
  if (!post) {
    const preview = text.slice(0, 600);
    console.error("[gemini] failed to parse JSON. First 600 chars:", preview);
    return { ok: false, failure: { kind: "json_parse_failed", preview } };
  }

  const minWords = compact ? 1200 : MIN_POST_WORDS;
  const words = countWords(post.content);
  if (words < minWords) {
    console.error(`[gemini] generated content too short: ${words} words (min ${minWords}).`);
    return { ok: false, failure: { kind: "too_short", words, minWords } };
  }

  const enriched = enrichPostForSeo(post);
  const qualityIssue = validatePostQuality(enriched);
  if (qualityIssue) {
    const reason = qualityFailureToMessage(qualityIssue);
    console.error("[gemini] content quality blocked:", reason);
    return { ok: false, failure: { kind: "content_blocked", reason } };
  }

  return { ok: true, post: enriched };
}

function qualityFailureToMessage(f: PostQualityFailure): string {
  switch (f.kind) {
    case "blocked_content":
      return f.reason;
    case "sensitive_news":
      return "Sensitive news topic — skipped for policy safety";
    case "too_short":
      return `Too short: ${f.words} words`;
    case "invalid_title":
      return "Invalid or missing title";
    default:
      return "Content quality check failed";
  }
}

export async function generateBlogPost(options?: { slot?: PostSlot }): Promise<
  | { ok: true; post: GeneratedPost; slot: PostSlot }
  | { ok: false; failure: GenerateBlogPostFailure }
> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false, failure: { kind: "missing_api_key" } };

  const slot: PostSlot = options?.slot ?? 0;
  const forceCompact =
    process.env.GEMINI_COMPACT === "1" || process.env.GEMINI_COMPACT === "true";
  const modes: boolean[] = forceCompact ? [true] : [false, true];
  let lastFailure: GenerateBlogPostFailure | null = null;
  let attempts = 0;

  for (const compact of modes) {
    if (attempts >= MAX_GENERATION_ATTEMPTS) break;
    attempts++;

    const result = await attemptGenerate(apiKey, compact, slot);
    if (result.ok) return { ...result, slot };

    lastFailure = result.failure;
    if (
      result.failure.kind === "project_suspended" ||
      result.failure.kind === "quota_exceeded"
    ) {
      return result;
    }
    if (!isRetryableFailure(result.failure)) {
      return result;
    }
    console.error(`[gemini] attempt failed (compact=${compact}), retrying...`, result.failure.kind);
  }

  return { ok: false, failure: lastFailure ?? { kind: "api_error", message: "Generation failed" } };
}