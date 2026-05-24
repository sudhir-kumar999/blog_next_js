// app/category/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import BlogCard from "@/components/BlogCard";
import { SITE_BASE_URL } from "@/lib/site-config";
import { STUDY_NAV_CATEGORIES } from "@/lib/study-nav";

export const revalidate = 60; // ISR – SEO friendly
export const dynamicParams = true;

/* ======================================================
   STATIC PARAMS (SSG for categories)
====================================================== */
export async function generateStaticParams() {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("slug");

  const fromDb =
    error || !data
      ? []
      : data
          .filter((cat) => cat.slug && typeof cat.slug === "string")
          .map((cat) => ({ slug: cat.slug.trim().replace(/\s+/g, "-") }))
          .filter((c) => c.slug.length > 0);

  const slugs = new Set(fromDb.map((c) => c.slug));
  for (const cat of STUDY_NAV_CATEGORIES) {
    if (!slugs.has(cat.slug)) fromDb.push({ slug: cat.slug });
  }
  return fromDb;
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

  const staticCat = STUDY_NAV_CATEGORIES.find((c) => c.slug === slug);

  const { data: category } = await supabaseServer
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();

  const name = category?.name ?? staticCat?.name;

  if (!name) {
    return {
      title: "Category not found",
      description: "This category does not exist",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_BASE_URL}/category/${slug}`;
  return {
    title: `${name} — Study Material`,
    description: `Hindi ${name.toLowerCase()} for competitive and board exams on StudyMitra.`,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: `${name} — Study Material`,
      description: `Hindi ${name.toLowerCase()} for competitive and board exams.`,
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

  const staticCat = STUDY_NAV_CATEGORIES.find((c) => c.slug === slug);

  const { data: category } = await supabaseServer
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  const displayCategory = category ?? (staticCat ? { id: "", name: staticCat.name, slug: staticCat.slug } : null);

  if (!displayCategory) {
    notFound();
  }

  let postsQuery = supabaseServer
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

  if (category?.id) {
    postsQuery = postsQuery.eq("category_id", category.id);
  }

  const { data: posts } = await postsQuery;

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            {displayCategory.name}
          </h1>
          <p className="mt-4 text-zinc-600 sm:text-lg">
            Latest study material in {displayCategory.name}
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
