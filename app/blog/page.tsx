// app/blog/page.tsx
// SEO: Server Component – data fetched on server, full HTML in initial response (no client fetch).
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { SITE_BASE_URL } from "@/lib/site-config";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60s; no client-side data fetch.

const blogUrl = `${SITE_BASE_URL}/blog`;
export const metadata: Metadata = {
  title: "Blog - Latest Articles & Tutorials",
  description: "Explore our latest blog posts, tutorials, and guides on web development, design, and technology.",
  alternates: { canonical: blogUrl },
  openGraph: {
    url: blogUrl,
    title: "Blog - Latest Articles & Tutorials",
    description: "Explore our latest blog posts, tutorials, and guides on web development, design, and technology.",
  },
  robots: { index: true, follow: true },
};

interface Category {
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  categories: Category[] | Category | null;
}

function getFirstCategory(categories: Post["categories"]): Category | null {
  if (!categories) return null;
  return Array.isArray(categories) ? categories[0] ?? null : categories;
}

export default async function BlogPage() {
  const { data: posts } = await supabaseServer
    .from("posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      categories (
        name,
        slug
      )
    `)
    .eq("published", true)
    .order("published_at", { ascending: false });

  const typedPosts = posts as Post[] | null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block">
            <h1 className="bg-gradient-to-r from-black via-zinc-800 to-black bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              Blog
            </h1>
            <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>
          <p className="mt-6 text-lg text-zinc-600 sm:text-xl">
            Articles, tutorials and guides on web development
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Posts Grid */}
        <section>
          {typedPosts && typedPosts.length > 0 ? (
            <>
              {/* Featured Post (First one) */}
              <article className="mb-12 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className="p-8 sm:p-10">
                  {(() => {
                    const cat = getFirstCategory(typedPosts[0].categories);
                    return cat ? (
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {cat.name}
                      </span>
                    ) : null;
                  })()}
                  <h2 className="mt-4 text-3xl font-bold leading-tight text-black sm:text-4xl">
                    <Link 
                      href={`/blog/${typedPosts[0].slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {typedPosts[0].title}
                    </Link>
                  </h2>
                  {typedPosts[0].excerpt && (
                    <p className="mt-4 text-lg text-zinc-600 line-clamp-3">
                      {typedPosts[0].excerpt}
                    </p>
                  )}
                  <div className="mt-6 flex items-center justify-between">
                    <time 
                      dateTime={typedPosts[0].published_at}
                      className="text-sm text-zinc-500"
                    >
                      {new Date(typedPosts[0].published_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                    <Link
                      href={`/blog/${typedPosts[0].slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-all hover:gap-2 hover:text-blue-700"
                    >
                      Read article
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>

              {/* Rest of Posts */}
              {typedPosts.length > 1 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {typedPosts.slice(1).map((post) => (
                    <article
                      key={post.id}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="p-6">
                        {(() => {
                          const cat = getFirstCategory(post.categories);
                          return cat ? (
                            <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                              {cat.name}
                            </span>
                          ) : null;
                        })()}
                        <h3 className="mt-3 text-xl font-bold leading-tight text-black transition-colors group-hover:text-blue-600">
                          <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true"></span>
                            {post.title}
                          </Link>
                        </h3>
                        {post.excerpt && (
                          <p className="mt-3 text-sm text-zinc-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <time 
                            dateTime={post.published_at}
                            className="text-xs text-zinc-500"
                          >
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                          <span className="inline-flex items-center text-xs font-medium text-blue-600 transition-transform group-hover:translate-x-1">
                            Read more
                            <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
                <svg className="h-10 w-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-800">No posts yet</h2>
              <p className="mt-2 text-zinc-500">
                Check back soon for new articles and tutorials!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}