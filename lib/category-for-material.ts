import { supabaseServer } from "@/lib/supabase/server";
import { STUDY_CATEGORY_SLUGS } from "@/lib/study-categories";
import type { StudyMaterialType } from "@/lib/study-material";

/** Resolve Supabase category_id for auto-published study posts */
export async function getCategoryIdForMaterialType(
  materialType: StudyMaterialType
): Promise<string | null> {
  const slug = STUDY_CATEGORY_SLUGS[materialType];
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("[category-for-material] lookup failed:", error.message);
    return null;
  }
  return data?.id ?? null;
}
