import type { Metadata } from "next";
import Link from "next/link";
import SchemaMarkup from "@/components/SchemaMarkup";
import { CONTACT_EMAIL, SITE_BASE_URL, SITE_NAME } from "@/lib/site-config";

const url = `${SITE_BASE_URL}/contact`;

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE_NAME} for corrections, feedback, privacy requests, or general questions.`,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Contact ${SITE_NAME}`,
    description: `Contact StudyMitra for corrections, feedback, privacy requests, or general questions.`,
    url,
    locale: "hi_IN",
    siteName: SITE_NAME,
    images: [{ url: `${SITE_BASE_URL}/api/og?title=Contact%20StudyMitra&type=website`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact ${SITE_NAME}`,
    images: [`${SITE_BASE_URL}/api/og?title=Contact%20StudyMitra&type=website`],
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_BASE_URL },
      { "@type": "ListItem", position: 2, name: "Contact", item: url },
    ],
  };

  return (
    <>
      <SchemaMarkup type="BreadcrumbList" data={breadcrumbJsonLd} />
      <nav className="border-b border-zinc-100 bg-zinc-50/50 py-3">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <ol className="flex items-center gap-2 text-sm text-zinc-600">
            <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li>/</li>
            <li className="text-zinc-800 font-medium">Contact</li>
          </ol>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold text-zinc-900">Contact</h1>
      <p className="mt-6 text-zinc-600 leading-relaxed">
        {SITE_NAME} par koi sawal, post correction, privacy request, ya partnership query ho to niche
        email par contact karein.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-sm font-semibold text-zinc-900">Email</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-2 block text-lg font-medium text-blue-600 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-4 text-sm text-zinc-600">
          Subject line mein post ka URL zaroor likhein agar kisi article ki correction chahiye.
        </p>
      </div>

      <div className="mt-10 space-y-4 text-zinc-600">
        <h2 className="text-lg font-semibold text-zinc-900">Response time</h2>
        <p>Hum aam taur par 24–72 ghante (working days) ke andar reply karte hain.</p>

        <h2 className="text-lg font-semibold text-zinc-900">Useful links</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href="/editorial-policy" className="text-blue-600 hover:underline">
              Editorial policy
            </Link>
          </li>
          <li>
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link href="/disclaimer" className="text-blue-600 hover:underline">
              Disclaimer
            </Link>
          </li>
        </ul>
      </div>
    </main>
    </>
  );
}
