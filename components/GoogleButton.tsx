"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";

export default function GoogleButton() {
  async function signInWithGoogle() {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}`,
      },
    });
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="h-5 w-5"
      />
      Continue with Google
    </button>
  );
}
