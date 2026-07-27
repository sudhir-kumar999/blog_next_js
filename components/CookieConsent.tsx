"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "studymitra_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:p-5"
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm text-zinc-700">
          <p className="font-semibold text-zinc-900">Privacy & Cookies</p>
          <p className="mt-1 leading-relaxed">
            StudyMitra Google Analytics, AdSense, aur behtar experience ke liye cookies ka upyog
            karta hai. Aap inhe{" "}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </Link>{" "}
            me jaankari le sakte hain.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
