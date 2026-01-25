// app/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60; // ISR for SEO + fresh content

export default async function Home() {
  const { data: posts, error } = await supabaseServer
    .from("posts")
    .select("id, title, slug, excerpt, created_at")
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
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        {/* Heading with gradient */}
        <header className="mb-20 text-center">
          <div className="inline-block">
            <h1 className="bg-gradient-to-r from-black via-zinc-800 to-black bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              Latest Blog Posts
            </h1>
            <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>
          <p className="mt-6 text-lg text-zinc-600">
            Discover insights, stories, and ideas
          </p>
        </header>

        {/* Blog grid */}
        <section className="grid gap-8 sm:grid-cols-2">
          {posts?.map((post, index) => (
            <article
              key={post.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeIn 0.6s ease-out forwards',
                opacity: 0
              }}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              <div className="relative">
                <h2 className="text-2xl font-bold leading-tight text-black transition-colors group-hover:text-blue-600">
                  <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-4 line-clamp-3 text-zinc-600">
                  {post.excerpt}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <time className="text-sm text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  
                  <span className="inline-flex items-center text-sm font-medium text-blue-600 transition-transform group-hover:translate-x-1">
                    Read more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          ))}

          {posts?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-zinc-500">
                No posts published yet.
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Check back soon for new content!
              </p>
            </div>
          )}
        </section>
      </main>

      {/* <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style> */}
    </div>
  );
}