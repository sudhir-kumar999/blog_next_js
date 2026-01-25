import { supabaseBrowser } from "@/lib/supabase/browser";

export async function logout() {
  await supabaseBrowser.auth.signOut(); // ✅ clears localStorage

  // optional but safe
  localStorage.removeItem("supabase.auth.token");

  window.location.href = "/"; // or /auth/login
}
