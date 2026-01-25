"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const { isLoggedIn, user, role, logout, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCat, setOpenCat] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  // 🔹 Fetch categories
  useEffect(() => {
    supabaseBrowser
      .from("categories")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenCat(false);
    if (openCat) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openCat]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (openMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openMobile]);

  if (loading) return null;

  return (
    <>
      <header className="relative w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold tracking-tight text-black transition-colors hover:text-blue-600">
              MyBlog
            </Link>

            {/* ================= DESKTOP NAV ================= */}
            <div className="hidden items-center gap-8 md:flex">
              <Link 
                href="/blog" 
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-black"
              >
                Blog
              </Link>

              {/* Categories dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCat(!openCat);
                  }}
                  className="flex items-center gap-1 text-sm font-medium text-zinc-700 transition-colors hover:text-black"
                >
                  Categories
                  <svg 
                    className={`h-4 w-4 transition-transform ${openCat ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openCat && (
                  <div className="absolute left-0 z-[60] mt-3 w-56 animate-fadeIn rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setOpenCat(false)}
                          className="block rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black"
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-zinc-400">No categories yet</p>
                    )}
                  </div>
                )}
              </div>

              <Link 
                href="/about" 
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-black"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-black"
              >
                Contact
              </Link>
            </div>

            {/* ================= DESKTOP AUTH ================= */}
            <div className="hidden items-center gap-3 md:flex">
              {isLoggedIn ? (
                <>
                  {role === "admin" && (
                    <Link
                      href="/admin"
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="text-sm font-medium text-zinc-700 transition-colors hover:text-black"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-sm font-medium text-zinc-700 transition-colors hover:text-black"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* ================= HAMBURGER BUTTON ================= */}
            <button
              onClick={() => setOpenMobile(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 transition-colors hover:bg-zinc-100 md:hidden"
            >
              <svg className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {openMobile && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpenMobile(false)}
          />
          
          {/* Sidebar - Full Height */}
          <div className="fixed right-0 top-0 z-[9999] h-screen w-full max-w-sm animate-slideIn overflow-hidden bg-white shadow-2xl md:hidden">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-5">
                <span className="text-lg font-bold text-black">Menu</span>
                <button
                  onClick={() => setOpenMobile(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 transition-colors hover:bg-zinc-100"
                >
                  <svg className="h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links - Scrollable */}
              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-1">
                  <Link
                    href="/blog"
                    onClick={() => setOpenMobile(false)}
                    className="block rounded-lg px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black"
                  >
                    Blog
                  </Link>

                  {/* Categories */}
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black">
                      Categories
                      <svg 
                        className="h-4 w-4 transition-transform group-open:rotate-180" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-100 pl-4">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setOpenMobile(false)}
                            className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
                          >
                            {cat.name}
                          </Link>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-zinc-400">No categories</p>
                      )}
                    </div>
                  </details>

                  <Link
                    href="/about"
                    onClick={() => setOpenMobile(false)}
                    className="block rounded-lg px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black"
                  >
                    About
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setOpenMobile(false)}
                    className="block rounded-lg px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black"
                  >
                    Contact
                  </Link>
                </div>

                {/* Auth Section */}
                <div className="mt-6 space-y-2 border-t border-zinc-200 pt-6">
                  {isLoggedIn ? (
                    <>
                      {role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setOpenMobile(false)}
                          className="block rounded-lg bg-blue-50 px-4 py-3 text-center font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setOpenMobile(false);
                        }}
                        className="block w-full rounded-lg px-4 py-3 text-center font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setOpenMobile(false)}
                        className="block rounded-lg px-4 py-3 text-center font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-black"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setOpenMobile(false)}
                        className="block rounded-lg bg-black px-4 py-3 text-center font-semibold text-white transition-all hover:bg-zinc-800"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}