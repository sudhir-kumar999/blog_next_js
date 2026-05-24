import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_BASE_URL, SITE_NAME } from "@/lib/site-config";

const url = `${SITE_BASE_URL}/disclaimer`;

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Educational disclaimer for ${SITE_NAME} — accuracy, vacancies, and third-party ads.`,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-zinc-700">
      <h1 className="text-3xl font-bold text-zinc-900">Disclaimer</h1>

      <div className="mt-10 space-y-8 text-zinc-600 leading-relaxed">
        <p>
          {SITE_NAME} par publish ki gayi information sirf educational aur informational purpose ke liye
          hai. Official exam notifications aur vacancy details ke liye hamesha government / recruiting
          body ki official website check karein.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Not professional advice</h2>
          <p>
            Content yahan legal, financial, medical, ya career guarantee nahi hai. Important decisions
            ke liye qualified advisors ya official sources use karein.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Exam &amp; vacancy information</h2>
          <p>
            Hum summaries aur preparation guides share karte hain. Cut-off, dates, fees, or eligibility
            kabhi bhi change ho sakti hai. {SITE_NAME} kisi post par selection ya job ka guarantee
            nahi deta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Accuracy &amp; corrections</h2>
          <p>
            Errors ho sakte hain. Correction ke liye post URL ke saath{" "}
            <a className="font-medium text-blue-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            par likhein.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">AI-assisted content</h2>
          <p>
            Kuch articles AI tools se draft ho kar edit kiye ja sakte hain. Hum misleading claims,
            piracy, aur policy-violating content avoid karte hain. Details:{" "}
            <Link href="/editorial-policy" className="font-medium text-blue-600 hover:underline">
              Editorial policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Ads</h2>
          <p>
            Site par Google AdSense ya anya third-party ads ho sakte hain. Ads clearly labelled hote
            hain. Ad par click karne se aapko hamari taraf se extra charge nahi hota.
          </p>
        </section>

        <p>
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms
          </Link>
        </p>
      </div>
    </main>
  );
}
