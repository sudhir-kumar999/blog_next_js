import type { Metadata } from "next";
import Link from "next/link";
import {
  CONTACT_EMAIL,
  PUBLISHER_LOCATION,
  PUBLISHER_NAME,
  SITE_BASE_URL,
} from "@/lib/site-config";

const url = `${SITE_BASE_URL}/privacy-policy`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How StudyMitra collects, uses, and protects your information, including cookies and Google AdSense.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-zinc-700">
      <h1 className="text-3xl font-bold text-zinc-900">Privacy Policy</h1>
      <p className="mt-4 text-sm text-zinc-500">Effective date: {new Date().getFullYear()}-01-01</p>
      <p className="mt-4 text-zinc-600">
        This policy describes how {PUBLISHER_NAME} ({SITE_BASE_URL}), operated from {PUBLISHER_LOCATION},
        handles information when you use our website.
      </p>

      <div className="mt-10 space-y-8 text-zinc-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Information we collect</h2>
          <p>
            You can read articles without creating an account. If you register or contact us, we may
            process the details you provide (for example: email address and message content) only to
            operate the service and respond to you.
          </p>
          <p>
            Like most websites, our servers and analytics tools may automatically log technical data
            such as IP address, browser type, device type, referring URL, and pages viewed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Cookies and similar technologies</h2>
          <p>
            We use cookies and similar technologies to remember preferences, measure traffic, and
            support advertising. You can block or delete cookies in your browser settings; some
            features may not work correctly if cookies are disabled.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Google Analytics</h2>
          <p>
            We use Google Analytics to understand how visitors use the site (for example: popular
            pages and general traffic trends). Google may process data according to its own policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Google AdSense &amp; advertising</h2>
          <p>
            We use Google AdSense to display ads. Google and its partners may use cookies to serve
            ads based on your prior visits to this site and other sites.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <a
                className="font-medium text-blue-600 hover:underline"
                href="https://policies.google.com/technologies/ads"
                rel="noopener noreferrer"
                target="_blank"
              >
                How Google uses data in advertising
              </a>
            </li>
            <li>
              <a
                className="font-medium text-blue-600 hover:underline"
                href="https://adssettings.google.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google Ads Settings (personalized ads opt-out)
              </a>
            </li>
            <li>
              <a
                className="font-medium text-blue-600 hover:underline"
                href="https://www.aboutads.info/choices/"
                rel="noopener noreferrer"
                target="_blank"
              >
                AboutAds.info choices (US)
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">How we use information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Provide and improve the website and study content</li>
            <li>Respond to contact and correction requests</li>
            <li>Measure traffic and prevent abuse</li>
            <li>Display and measure advertisements</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Data retention</h2>
          <p>
            Contact messages are kept only as long as needed to handle your request. Server logs are
            retained for a limited period for security and analytics, then deleted or aggregated.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Children&apos;s privacy</h2>
          <p>
            Our content is aimed at students, including minors preparing for exams. We do not
            knowingly collect personal information from children under 13 without parental consent.
            If you believe a child has provided personal data, contact us and we will delete it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Your choices</h2>
          <p>
            You may request access, correction, or deletion of personal data you sent us by email.
            We may need to keep certain records for legal or security reasons.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a className="font-medium text-blue-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            {" · "}
            <Link href="/contact" className="font-medium text-blue-600 hover:underline">
              Contact page
            </Link>
          </p>
        </section>

        <p className="text-sm">
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms &amp; Conditions
          </Link>
          {" · "}
          <Link href="/disclaimer" className="text-blue-600 hover:underline">
            Disclaimer
          </Link>
        </p>
      </div>
    </main>
  );
}
