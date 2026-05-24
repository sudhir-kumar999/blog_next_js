/** Only study-material content — no news or general viral topics */

export type StudyMaterialType = "notes" | "questions" | "mock-test" | "vacancy";

export type PostSlot = 0 | 1;

export type TopicSeed = {
  category: string;
  keywords: string;
  hint: string;
  viralAngle: string;
};

export type ResolvedStudyTopic = TopicSeed & {
  materialType: StudyMaterialType;
};

const NOTES_TOPICS: TopicSeed[] = [
  {
    category: "SSC CGL 2026 — पूरी नोट्स और सिलेबस वाइज प्लान",
    keywords: "SSC CGL notes Hindi, SSC syllabus 2026, SSC preparation notes",
    hint: "Tier-wise syllabus, subject notes, 90-day plan, important topics only",
    viralAngle: "Download-style value: 'एक जगह पूरी तैयारी'",
  },
  {
    category: "NEET UG 2026 — Biology/Chemistry/Physics नोट्स सार",
    keywords: "NEET notes Hindi, NCERT summary NEET, NEET revision notes",
    hint: "Chapter-wise high-yield points, NCERT lines, diagrams in text",
    viralAngle: "Toppers' short notes — save before exam",
  },
  {
    category: "UPSC Prelims — पॉलिटी और इतिहास की संक्षिप्त नोट्स",
    keywords: "UPSC notes Hindi, polity notes, history notes UPSC",
    hint: "Articles, dynasties, maps in bullets — revision friendly",
    viralAngle: "One-page revision sheets mindset",
  },
  {
    category: "Railway RRB — GK, Math, Reasoning नोट्स एक साथ",
    keywords: "Railway exam notes Hindi, RRB study material, RRB GK notes",
    hint: "Formula sheet, static GK buckets, reasoning patterns",
    viralAngle: "Group D / NTPC students ke liye must-save",
  },
  {
    category: "Board Exam 2026 — 10th/12th विषयवार नोट्स और फॉर्मूला",
    keywords: "board exam notes Hindi, 10th 12th revision, board formula sheet",
    hint: "Math science social — last-minute revision blocks",
    viralAngle: "Parents + students WhatsApp share",
  },
  {
    category: "Banking Exam — Quant, Reasoning, English नोट्स",
    keywords: "bank exam notes Hindi, IBPS notes, SBI clerk study material",
    hint: "Shortcuts, grammar rules, puzzle types — crisp tables",
    viralAngle: "Interview se pehle revision pack",
  },
];

const QUESTIONS_TOPICS: TopicSeed[] = [
  {
    category: "SSC CGL — 50 महत्वपूर्ण प्रश्न (Math + Reasoning + GK)",
    keywords: "SSC CGL questions Hindi, SSC MCQ practice, SSC previous year",
    hint: "Mixed difficulty MCQs with detailed Hindi explanations",
    viralAngle: "Daily practice set — 'aaj ke 50 sawal'",
  },
  {
    category: "करंट अफेयर्स — इस महीने के TOP 40 परीक्षा प्रश्न",
    keywords: "current affairs questions Hindi 2026, monthly CA MCQ",
    hint: "Exam-only CA — schemes, awards, appointments — no gossip news",
    viralAngle: "Screenshot-friendly numbered Q&A",
  },
  {
    category: "Indian Polity — 30 MCQ संविधान से",
    keywords: "polity MCQ Hindi, constitution questions UPSC SSC",
    hint: "Articles, amendments, bodies — trap options included",
    viralAngle: "Har competitive exam mein aata hai",
  },
  {
    category: "Math Short Tricks — 25 प्रश्न उत्तर सहित",
    keywords: "math MCQ Hindi, SSC math questions, percentage profit loss",
    hint: "One trick multiple questions — show shortcut then MCQ",
    viralAngle: "Reel-style '1 trick = 5 questions'",
  },
  {
    category: "REET/CTET — Child Development + Pedagogy प्रश्न",
    keywords: "REET questions Hindi, CTET MCQ, pedagogy practice",
    hint: "25-30 MCQs with why wrong options fail",
    viralAngle: "Teacher exam aspirants ka daily drill",
  },
  {
    category: "General Science — Physics Chemistry Biology MCQ बैंक",
    keywords: "general science MCQ Hindi, railway science questions",
    hint: "Class 6-10 level GS for Railway, SSC, state exams",
    viralAngle: "Easy marks section — don't skip",
  },
];

const MOCK_TEST_TOPICS: TopicSeed[] = [
  {
    category: "SSC CGL Tier-1 — पूर्ण मॉक टेस्ट (100 प्रश्न) + उत्तर कुंजी",
    keywords: "SSC CGL mock test Hindi, SSC free mock, SSC practice paper",
    hint: "Full paper structure, timer advice, section-wise analysis after answers",
    viralAngle: "Sunday mock ritual for serious aspirants",
  },
  {
    category: "Railway RRB NTPC — मॉक टेस्ट पेपर (Hindi)",
    keywords: "RRB mock test Hindi, railway practice paper, NTPC mock",
    hint: "GK + math + reasoning mix, realistic difficulty",
    viralAngle: "Vacancy season = mock test search spike",
  },
  {
    category: "NEET UG — Biology-heavy मॉक (60 MCQ) + समाधान",
    keywords: "NEET mock test Hindi, NEET biology practice, NEET MCQ",
    hint: "NCERT-based, assertion-reason if relevant, time management tips",
    viralAngle: "Rank improve karne wala weekly test",
  },
  {
    category: "UPSC Prelims GS — मिनी मॉक (50 प्रश्न)",
    keywords: "UPSC mock test Hindi, prelims practice paper, UPSC MCQ",
    hint: "Polity history economy environment mix — explain elimination strategy",
    viralAngle: "Serious aspirants bookmark this",
  },
  {
    category: "Banking PO/Clerk — फुल लेंथ मॉक टेस्ट",
    keywords: "bank mock test Hindi, IBPS mock paper, SBI practice test",
    hint: "Quant reasoning English GA — sectional cutoff tips",
    viralAngle: "Prelims se pehle last 10 days plan",
  },
  {
    category: "Police/SI State Exam — मॉक टेस्ट + Physical tips",
    keywords: "police exam mock Hindi, SI practice paper, constable mock test",
    hint: "State-wise generic pattern, Hindi GK heavy",
    viralAngle: "Local job dream + practice paper combo",
  },
];

const VACANCY_TOPICS: TopicSeed[] = [
  {
    category: "SSC CGL 2026 — नोटिफिकेशन, पद, योग्यता, आवेदन गाइड",
    keywords: "SSC CGL vacancy 2026, SSC notification Hindi, SSC apply online",
    hint: "Official-style summary: posts, age, fees, dates — no fake vacancies",
    viralAngle: "Form bharne se pehle poori clarity",
  },
  {
    category: "Railway RRB — नवीनतम भर्ती/वैकेंसी विवरण",
    keywords: "railway vacancy 2026 Hindi, RRB recruitment, railway bharti",
    hint: "Eligibility, exam stages, syllabus link to preparation",
    viralAngle: "Lakhs of applicants — clear Hindi breakdown",
  },
  {
    category: "UPSC Civil Services 2026 — महत्वपूर्ण तिथियाँ और पात्रता",
    keywords: "UPSC vacancy 2026, UPSC notification Hindi, IAS form date",
    hint: "Calendar, attempts, age limit, optional overview",
    viralAngle: "Dream job timeline in one post",
  },
  {
    category: "Banking (SBI/IBPS) — क्लर्क/PO भर्ती विवरण",
    keywords: "bank vacancy 2026 Hindi, IBPS recruitment, SBI clerk notification",
    hint: "Stages, salary overview (public sources), preparation link",
    viralAngle: "Stable job + salary table hook",
  },
  {
    category: "State Police/SI — भर्ती अपडेट और परीक्षा पैटर्न",
    keywords: "police vacancy Hindi 2026, SI recruitment state, constable bharti",
    hint: "Generic state pattern + how to prepare after applying",
    viralAngle: "Local pride + job security",
  },
  {
    category: "Teaching (REET/CTET/TET) — वैकेंसी और आवेदन टिप्स",
    keywords: "REET vacancy Hindi, CTET notification, teacher recruitment",
    hint: "Eligibility, certificate rules, exam dates when known",
    viralAngle: "Teacher job = family celebration framing",
  },
];

const POOLS: Record<StudyMaterialType, TopicSeed[]> = {
  notes: NOTES_TOPICS,
  questions: QUESTIONS_TOPICS,
  "mock-test": MOCK_TEST_TOPICS,
  vacancy: VACANCY_TOPICS,
};

function materialTypeForSlot(slot: PostSlot, dateSeed: number): StudyMaterialType {
  const slotTypes: StudyMaterialType[] =
    slot === 0 ? ["notes", "mock-test"] : ["questions", "vacancy"];
  return slotTypes[dateSeed % slotTypes.length];
}

export function resolveStudyTopic(slot: PostSlot): ResolvedStudyTopic {
  const today = new Date();
  const dateSeed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate() +
    slot * 997;

  const materialType = materialTypeForSlot(slot, dateSeed);
  const pool = POOLS[materialType];
  const primaryIndex = dateSeed % pool.length;
  const finalIndex = (primaryIndex + Math.floor(Math.random() * 2)) % pool.length;

  return {
    ...pool[finalIndex],
    materialType,
  };
}

export function parsePostSlot(req: Request): PostSlot {
  const url = new URL(req.url);
  const p = url.searchParams.get("slot");
  if (p === "1" || p === "evening") return 1;
  if (p === "0" || p === "morning") return 0;
  const hour = new Date().getUTCHours();
  return hour < 12 ? 0 : 1;
}

export function slotLabel(slot: PostSlot): string {
  return slot === 0 ? "notes-or-mock" : "questions-or-vacancy";
}
