// app/category/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import BlogCard from "@/components/BlogCard";
import { SITE_BASE_URL } from "@/lib/site-config";

export const revalidate = 60; // ISR – SEO friendly
export const dynamicParams = true;

/* ======================================================
   STATIC PARAMS (SSG for categories)
====================================================== */
export async function generateStaticParams() {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("slug");

  if (error || !data) return [];

  return data
    .filter((cat) => cat.slug && typeof cat.slug === "string")
    .map((cat) => ({
      slug: cat.slug.trim().replace(/\s+/g, "-"),
    }))
    .filter((c) => c.slug.length > 0);
}

/* ======================================================
   SEO METADATA
====================================================== */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: category } = await supabaseServer
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();

  if (!category) {
    return {
      title: "Category not found",
      description: "This category does not exist",
    };
  }

  const url = `${SITE_BASE_URL}/category/${slug}`;
  return {
    title: `${category.name} Articles`,
    description: `Read all posts related to ${category.name}`,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: `${category.name} Articles`,
      description: `Read all posts related to ${category.name}`,
      type: "website",
      url,
    },
  };
}

/* ======================================================
   PAGE COMPONENT
====================================================== */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 🔹 Get category
  const { data: category } = await supabaseServer
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  // 🔹 Get posts under this category
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
    .eq("category_id", category.id)
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 text-zinc-600 sm:text-lg">
            Latest articles in {category.name}
          </p>
          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              <span aria-hidden="true">←</span> Back to Blog
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {posts && posts.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold text-zinc-800">No posts yet</h2>
            <p className="mt-2 text-zinc-500">Check back soon for new articles.</p>
          </div>
        )}
      </main>
    </div>
  );
}
