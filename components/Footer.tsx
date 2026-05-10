import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              StudyMitra
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Hindi education blog for exams, schemes, and study resources.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Contact:{" "}
              <Link className="font-medium text-blue-600 hover:underline" href="/contact">
                contact@studymitra.in
              </Link>
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-black dark:text-white">Pages</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-black dark:text-white">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <h4 className="font-medium text-black dark:text-white">© {new Date().getFullYear()}</h4>
            <p className="mt-2 text-sm text-zinc-600">All rights reserved.</p>
            <p className="mt-3 text-xs text-zinc-500">
              Some links may be external. Ads may appear via Google AdSense.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
