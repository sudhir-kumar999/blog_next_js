import Link from "next/link";
import AdSenseSlot from "@/components/AdSenseSlot";
import { ADSENSE_SLOTS } from "@/lib/adsense-config";

const linkClass =
  "text-zinc-600 transition-colors hover:text-blue-600 focus-visible:text-blue-600";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 text-zinc-700">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold text-zinc-900">
              StudyMitra
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-600">
              Hindi education blog — exam prep, government schemes, trending news, and study
              guides for Indian students.
            </p>
            <p className="mt-4 text-sm text-zinc-600">
              Email:{" "}
              <a
                href="mailto:contact@studymitra.in"
                className="font-medium text-blue-600 hover:underline"
              >
                contact@studymitra.in
              </a>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
              Pages
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/blog" className={linkClass}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  About
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
            <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
              Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className={linkClass}>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
              Follow
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Daily useful posts in simple Hindi. Share with friends on WhatsApp.
            </p>
          </div>
        </div>

        {ADSENSE_SLOTS.footer ? (
          <div className="mt-10 border-t border-zinc-200 pt-8">
            <AdSenseSlot slot={ADSENSE_SLOTS.footer} format="horizontal" label="Sponsored" />
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-zinc-600">
            © {year} StudyMitra. All rights reserved.
          </p>
          <p className="text-xs text-zinc-500">
            Ads by Google AdSense. External links may open third-party sites.
          </p>
        </div>
      </div>
    </footer>
  );
}
