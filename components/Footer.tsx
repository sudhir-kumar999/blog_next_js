import Link from "next/link";
import AdSenseSlot from "@/components/AdSenseSlot";
import { ADSENSE_SLOTS } from "@/lib/adsense-config";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site-config";
import { STUDY_NAV_CATEGORIES } from "@/lib/study-nav";

const linkClass =
  "inline-flex min-h-[44px] items-center text-sm text-zinc-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md -ml-1 px-1";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-white text-zinc-700">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Brand + CTA row */}
        <div className="flex flex-col gap-8 border-b border-zinc-200/80 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
            >
              {SITE_NAME}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
              Hindi study material — notes, practice questions, mock tests, and government exam
              vacancy details. New posts are published automatically for students.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <span aria-hidden="true">✉</span>
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Read blog
            </Link>
            <Link
              href="/category/study-notes"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Study notes
            </Link>
          </div>
        </div>

        {/* Link columns — responsive grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Study material
            </h2>
            <ul className="mt-3 space-y-0.5">
              {STUDY_NAV_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className={linkClass}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Explore
            </h2>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link href="/blog" className={linkClass}>
                  All posts
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className={linkClass}>
                  Editorial policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Legal
            </h2>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link href="/privacy-policy" className={linkClass}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className={linkClass}>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Exams we cover
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              SSC, Railway, UPSC, NEET, JEE, Board 10th/12th, Banking, Police, REET/CTET, and more —
              in simple Hindi.
            </p>
          </div>
        </div>

        {ADSENSE_SLOTS.footer ? (
          <div className="mt-10 rounded-xl border border-zinc-100 bg-white/80 p-4 sm:p-6">
            <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-400 sm:text-xs">
              Sponsored
            </p>
            <AdSenseSlot slot={ADSENSE_SLOTS.footer} format="horizontal" label="" />
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-zinc-200/80 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-zinc-600">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-zinc-500">
            Educational content only. Verify official notifications before applying. Ads by Google
            AdSense where enabled.
          </p>
        </div>
      </div>
    </footer>
  );
}
