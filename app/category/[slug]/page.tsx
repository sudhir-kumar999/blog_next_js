// app/category/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import BlogCard from "@/components/BlogCard";

export const revalidate = 60; // ISR – SEO friendly

/* ======================================================
   STATIC PARAMS (SSG for categories)
====================================================== */
export async function generateStaticParams() {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("slug");

  if (error || !data) return [];

  return data.map((cat) => ({
    slug: cat.slug,
  }));
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

  return {
    title: `${category.name} Articles`,
    description: `Read all posts related to ${category.name}`,
    openGraph: {
      title: `${category.name} Articles`,
      description: `Read all posts related to ${category.name}`,
      type: "website",
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
    <main className="mx-auto max-w-3xl px-6 py-24">
      {/* ================= Header ================= */}
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold">
          {category.name}
        </h1>

        <p className="mt-4 text-zinc-600">
          Articles related to {category.name}
        </p>
      </header>

      {/* ================= Posts ================= */}
      <section className="space-y-10">
        {posts?.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}

        {posts?.length === 0 && (
          <p className="text-center text-zinc-500">
            No posts found in this category.
          </p>
        )}
      </section>

      {/* ================= Back link ================= */}
      <div className="mt-16 text-center">
        <Link
          href="/blog"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Blog
        </Link>
      </div>
    </main>
  );
}
