import Link from "next/link";
import type { Metadata } from "next";
import { STUDY_NAV_CATEGORIES } from "@/lib/study-nav";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist on StudyMitra.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900">Page not found</h1>
      <p className="mt-4 text-zinc-600">
        Yeh page exist nahi karta. Neeche se blog, study categories, ya home par ja sakte hain.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Home
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          All posts
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Contact
        </Link>
      </div>
      <div className="mt-10">
        <p className="text-sm font-semibold text-zinc-900">Study material</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {STUDY_NAV_CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/category/${cat.slug}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:border-blue-300 hover:text-blue-600"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
