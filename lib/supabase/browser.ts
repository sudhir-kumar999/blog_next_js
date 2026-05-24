import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && anonKey);

/** Browser Supabase client — null if env vars missing (avoids crashing public pages). */
export const supabaseBrowser: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, anonKey!)
  : null;

export function requireSupabaseBrowser(): SupabaseClient {
  if (!supabaseBrowser) {
    throw new Error("Missing Supabase browser environment variables");
  }
  return supabaseBrowser;
}
