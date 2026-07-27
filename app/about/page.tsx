import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_BASE_URL, SITE_NAME } from "@/lib/site-config";

const url = `${SITE_BASE_URL}/about`;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "StudyMitra is a Hindi study-material blog for competitive and board exams — notes, MCQs, mock tests, and vacancy guides.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    title: "About StudyMitra — Hindi Exam Preparation",
    description:
      "StudyMitra provides free Hindi study material: notes, practice questions, mock tests, and vacancy guides for SSC, Railway, NEET, UPSC.",
    url,
    locale: "hi_IN",
    siteName: SITE_NAME,
  },
};

export default function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_BASE_URL,
    description: "Free Hindi study material for competitive and board exams.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      url: `${SITE_BASE_URL}/contact`,
    },
    sameAs: [
      `https://www.facebook.com/studymitra`,
      `https://twitter.com/studymitra`,
      `https://www.instagram.com/studymitra`,
    ].filter(Boolean),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_BASE_URL },
      { "@type": "ListItem", position: 2, name: "About", item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav className="border-b border-zinc-100 bg-zinc-50/50 py-3">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <ol className="flex items-center gap-2 text-sm text-zinc-600">
            <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li>/</li>
            <li className="text-zinc-800 font-medium">About</li>
          </ol>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold text-zinc-900">About {SITE_NAME}</h1>

      <div className="mt-8 space-y-6 text-zinc-600 leading-relaxed">
        <p>
          {SITE_NAME} ek Hindi study-material website hai jahan hum sirf padhai se judi cheezein
          publish karte hain: study notes, practice questions, mock tests, aur government exam
          vacancy details.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Kiske liye hai yeh site?</h2>
          <p>
            Board students, SSC, Railway, UPSC, NEET, banking, police, teaching (REET/CTET), aur
            any competitive exam ki taiyari karne wale students — jo simple Hindi me clear material
            chahte hain.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Hum kya publish karte hain</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Revision notes aur syllabus-wise guides</li>
            <li>MCQ practice sets with answers</li>
            <li>Mock test papers</li>
            <li>Vacancy / notification summaries (official sources ke saath)</li>
          </ul>
          <p>
            Hum breaking news, entertainment, ya viral lifestyle posts publish nahi karte — sirf
            study niche.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Quality &amp; transparency</h2>
          <p>
            Articles helpful, original, aur exam-focused hone chahiye. Kuch content AI tools se draft
            ho sakta hai, lekin publish se pehle clarity aur policy checks hote hain. Vacancy ya exam
            dates hamesha official website par verify karein.
          </p>
          <p>
            <Link href="/editorial-policy" className="font-medium text-blue-600 hover:underline">
              Read our full editorial policy
            </Link>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900">Contact &amp; corrections</h2>
          <p>
            Galati mile ya suggestion ho to{" "}
            <a className="font-medium text-blue-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            par likhein ya{" "}
            <Link href="/contact" className="font-medium text-blue-600 hover:underline">
              contact page
            </Link>{" "}
            use karein.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
