import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_BASE_URL, SITE_NAME } from "@/lib/site-config";

const url = `${SITE_BASE_URL}/terms`;

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `Terms of use for ${SITE_NAME} — study material, user accounts, and advertising.`,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-zinc-700">
      <h1 className="text-3xl font-bold text-zinc-900">Terms &amp; Conditions</h1>
      <p className="mt-4 text-sm text-zinc-500">Effective date: {new Date().getFullYear()}-01-01</p>

      <div className="mt-10 space-y-8 text-zinc-600 leading-relaxed">
        <p>
          By using {SITE_NAME} ({SITE_BASE_URL}), you agree to these terms. If you do not agree, please
          do not use the website.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Use of the site</h2>
          <p>
            The site provides educational study material in Hindi. You may read and share links to our
            articles for personal, non-commercial learning. Scraping, automated republishing, or
            misrepresenting our content as your own is not allowed without written permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Accounts</h2>
          <p>
            If you create an account, you are responsible for keeping your login secure and for
            activity under your account. We may suspend accounts that abuse the service or violate
            these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Content accuracy</h2>
          <p>
            We strive for helpful, accurate study content but do not warrant that every article is
            complete, current, or error-free. Exam rules and vacancies change — verify on official
            sources before applying or making decisions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Copyright</h2>
          <p>
            Unless stated otherwise, text, design, and branding on this site are owned by {SITE_NAME}.
            You may not copy or republish substantial portions without permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">External links</h2>
          <p>
            Links to third-party sites (including government portals) are for convenience. We are not
            responsible for their content or policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Advertising</h2>
          <p>
            We may show third-party ads (for example, Google AdSense). Ad partners may use cookies as
            described in our{" "}
            <Link href="/privacy-policy" className="font-medium text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {SITE_NAME} is not liable for any indirect or
            consequential loss arising from use of the site or reliance on its content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Contact</h2>
          <p>
            Questions:{" "}
            <a className="font-medium text-blue-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            {" · "}
            <Link href="/contact" className="font-medium text-blue-600 hover:underline">
              Contact page
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
