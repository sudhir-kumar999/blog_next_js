// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase SERVER client
 * - Uses SERVICE ROLE KEY
 * - NEVER import this in client components
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});
