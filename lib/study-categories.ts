import type { StudyMaterialType } from "./study-material";

/** Supabase `categories.slug` — create these rows in admin/DB if missing */
export const STUDY_CATEGORY_SLUGS: Record<StudyMaterialType, string> = {
  notes: "study-notes",
  questions: "practice-questions",
  "mock-test": "mock-tests",
  vacancy: "vacancy-details",
};

export const STUDY_CATEGORY_LABELS: Record<StudyMaterialType, string> = {
  notes: "Study Notes",
  questions: "Practice Questions",
  "mock-test": "Mock Tests",
  vacancy: "Vacancy Details",
};
