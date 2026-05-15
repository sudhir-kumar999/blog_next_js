import { supabaseServer } from "./supabase/server";
import type { PostSlot } from "./gemini";

const MAX_POSTS_PER_DAY = 2;
const MIN_HOURS_BETWEEN_POSTS = 4;

function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Prevents API spam / duplicate cron runs — protects Google quota */
export async function canRunCronPublish(slot: PostSlot): Promise<
  | { ok: true }
  | { ok: false; reason: string }
> {
  const since = startOfUtcDay();

  const { count: todayCount, error: countError } = await supabaseServer
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("published", true)
    .gte("published_at", since);

  if (countError) {
    console.error("[cron-guard] count error:", countError);
    return { ok: true };
  }

  if ((todayCount ?? 0) >= MAX_POSTS_PER_DAY) {
    return {
      ok: false,
      reason: `Daily limit reached (${MAX_POSTS_PER_DAY} posts already published today). Skipping slot ${slot}.`,
    };
  }

  const { data: latest, error: latestError } = await supabaseServer
    .from("posts")
    .select("published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError || !latest?.published_at) {
    return { ok: true };
  }

  const hoursSince =
    (Date.now() - new Date(latest.published_at).getTime()) / (1000 * 60 * 60);

  if (hoursSince < MIN_HOURS_BETWEEN_POSTS) {
    return {
      ok: false,
      reason: `Too soon since last post (${hoursSince.toFixed(1)}h ago). Min gap: ${MIN_HOURS_BETWEEN_POSTS}h.`,
    };
  }

  return { ok: true };
}
