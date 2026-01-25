// lib/supabase/browser.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase BROWSER client
 * - Uses ANON KEY
 * - Safe for client components
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !anonKey) {
  throw new Error("Missing Supabase browser environment variables");
}

export const supabaseBrowser = createClient(supabaseUrl, anonKey);
