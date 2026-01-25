import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-black">
              My Blog
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              SEO friendly tech blogs built with Next.js & Supabase.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-black">Pages</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-black">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <h4 className="font-medium text-black">© {new Date().getFullYear()}</h4>
            <p className="mt-2 text-sm text-zinc-600">
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
