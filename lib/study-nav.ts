/** Always-available study sections (matches supabase/seed-study-categories.sql) */
export const STUDY_NAV_CATEGORIES = [
  { name: "Study Notes", slug: "study-notes" },
  { name: "Practice Questions", slug: "practice-questions" },
  { name: "Mock Tests", slug: "mock-tests" },
  { name: "Vacancy Details", slug: "vacancy-details" },
] as const;
