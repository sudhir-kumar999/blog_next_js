"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export async function logout(router?: ReturnType<typeof useRouter>) {
  await supabaseBrowser.auth.signOut();

  // Supabase already clears sb-* keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sb-")) {
      localStorage.removeItem(key);
    }
  });

  if (router) {
    router.replace("/");
    router.refresh(); // 🔥 important for server components
  } else {
    window.location.href = "/";
  }
}
