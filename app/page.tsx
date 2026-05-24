// app/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { SITE_BASE_URL } from "@/lib/site-config";
import type { Metadata } from "next";
import AdSenseSlot from "@/components/AdSenseSlot";
import { ADSENSE_SLOTS } from "@/lib/adsense-config";

export const revalidate = 60; // ISR for SEO + fresh content

export const metadata: Metadata = {
  title: "StudyMitra — नोट्स, प्रश्न, मॉक टेस्ट, वैकेंसी",
  description: "SSC, Railway, UPSC, NEET, Board — study notes, practice questions, mock tests और vacancy details हिंदी में।",
  alternates: { canonical: SITE_BASE_URL },
  openGraph: {
    url: SITE_BASE_URL,
    title: "StudyMitra — नोट्स, प्रश्न, मॉक टेस्ट, वैकेंसी",
    description: "SSC, Railway, UPSC, NEET, Board — study notes, practice questions, mock tests और vacancy details हिंदी में।",
  },
  robots: { index: true, follow: true },
};

export default async function Home() {
  const { data: posts, error } = await supabaseServer
    .from("posts")
    .select("id, title, slug, excerpt, published_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-600">Failed to load posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-block">
            <h1 className="bg-gradient-to-r from-black via-zinc-800 to-black bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              StudyMitra
            </h1>
            <div className="mt-3 h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>
          <p className="mt-6 text-lg text-zinc-600 sm:text-xl">
            Study notes, practice questions, mock tests aur sarkari exam vacancy — sirf padhai, simple Hindi me.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
            {[
              { label: "Notes", slug: "study-notes" },
              { label: "Questions", slug: "practice-questions" },
              { label: "Mock Tests", slug: "mock-tests" },
              { label: "Vacancy", slug: "vacancy-details" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Explore Blog
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      {ADSENSE_SLOTS.display ? (
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AdSenseSlot slot={ADSENSE_SLOTS.display} format="horizontal" />
        </div>
      ) : null}

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">Latest posts</h2>
            <p className="mt-1 text-sm text-zinc-600">Notes, MCQs, mocks &amp; vacancy updates.</p>
          </div>
          <Link className="text-sm font-semibold text-blue-600 hover:underline" href="/blog">
            View all →
          </Link>
        </div>

        <section className="grid gap-6 sm:grid-cols-2">
          {posts?.map((post, index) => {
            const dateStr = post.published_at || post.created_at;
            return (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  animationDelay: `${index * 60}ms`,
                  animation: "fadeIn 0.5s ease-out forwards",
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <h3 className="text-xl font-bold leading-snug text-black transition-colors group-hover:text-blue-600">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {post.title}
                    </Link>
                  </h3>

                  {post.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
                    <time dateTime={dateStr}>
                      {new Date(dateStr).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span className="inline-flex items-center gap-1 font-medium text-blue-600 transition-all group-hover:gap-2">
                      Read
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {posts?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-zinc-500">No posts published yet.</p>
              <p className="mt-2 text-sm text-zinc-400">Check back soon for new content!</p>
            </div>
          )}
        </section>

        <section className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold text-zinc-900">Trust &amp; policies</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-600">
            Clear navigation, contact details, and editorial standards for students and exam
            aspirants.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/about" className="font-medium text-blue-600 hover:underline">
              About
            </Link>
            <Link href="/editorial-policy" className="font-medium text-blue-600 hover:underline">
              Editorial policy
            </Link>
            <Link href="/privacy-policy" className="font-medium text-blue-600 hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="font-medium text-blue-600 hover:underline">
              Contact
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}