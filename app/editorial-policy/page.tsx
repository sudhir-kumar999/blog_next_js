import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_BASE_URL, SITE_NAME } from "@/lib/site-config";

const url = `${SITE_BASE_URL}/editorial-policy`;

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How StudyMitra creates and reviews study notes, practice questions, mock tests, and vacancy summaries.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-zinc-700">
      <h1 className="text-3xl font-bold text-zinc-900">Editorial Policy</h1>
      <p className="mt-4 text-sm text-zinc-500">Last updated: {new Date().getFullYear()}-01-01</p>

      <div className="mt-10 space-y-8 text-zinc-600 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Our mission</h2>
          <p>
            {SITE_NAME} is a Hindi study-material website for Indian students preparing for board
            exams, SSC, Railway, UPSC, NEET, banking, teaching exams, and other competitive tests.
            We publish only educational content: study notes, practice questions, mock tests, and
            summaries of government recruitment notifications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">What we publish</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Subject-wise notes and revision guides</li>
            <li>MCQ practice sets with answers and explanations</li>
            <li>Mock test papers for exam practice</li>
            <li>Vacancy and notification guides (with links to official sources)</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> publish breaking news, entertainment, lifestyle viral posts,
            pirated downloads, or unrelated general articles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">How content is created</h2>
          <p>
            Articles may be written or drafted with the help of AI tools, then edited for accuracy,
            clarity, and exam relevance. Before publishing, we check for minimum length, misleading
            claims, and policy-sensitive topics. Vacancy and exam-date information should always be
            verified on the official recruiting website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Accuracy and corrections</h2>
          <p>
            Education and recruitment rules change. If you find an error in any article, please email{" "}
            <a className="font-medium text-blue-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            with the post URL. We aim to review correction requests within 3–5 working days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">No guarantees</h2>
          <p>
            Study material on this site is for learning support only. We do not guarantee exam
            selection, ranks, cut-offs, or job placement. Official notifications always prevail over
            any summary on {SITE_NAME}.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Advertising</h2>
          <p>
            We may show ads from Google AdSense. Ads are labelled clearly. Editorial content is not
            sold to advertisers. See our{" "}
            <Link href="/privacy-policy" className="font-medium text-blue-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            for how ad partners may use cookies.
          </p>
        </section>

        <p className="text-sm">
          <Link href="/about" className="font-medium text-blue-600 hover:underline">
            About us
          </Link>
          {" · "}
          <Link href="/contact" className="font-medium text-blue-600 hover:underline">
            Contact
          </Link>
          {" · "}
          <Link href="/disclaimer" className="font-medium text-blue-600 hover:underline">
            Disclaimer
          </Link>
        </p>
      </div>
    </main>
  );
}
