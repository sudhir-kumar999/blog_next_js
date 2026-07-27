// app/category/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import BlogCard from "@/components/BlogCard";
import { SITE_BASE_URL } from "@/lib/site-config";
import { STUDY_NAV_CATEGORIES } from "@/lib/study-nav";
import { categorySeo } from "@/lib/seo";

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

  const seo = categorySeo(slug, name);
  const url = `${SITE_BASE_URL}/category/${slug}`;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url,
      locale: "hi_IN",
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

  const seo = categorySeo(displayCategory.slug, displayCategory.name);

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

  const categoryUrl = `${SITE_BASE_URL}/category/${slug}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: seo.h1, item: categoryUrl },
    ],
  };
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.title,
    description: seo.description,
    url: categoryUrl,
    inLanguage: "hi-IN",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (posts ?? []).slice(0, 20).map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_BASE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <nav className="border-b border-zinc-100 bg-zinc-50/50 py-3">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <ol className="flex items-center gap-2 text-sm text-zinc-600">
            <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="text-blue-600 hover:underline">Blog</Link></li>
            <li>/</li>
            <li className="text-zinc-800 font-medium">{seo.h1}</li>
          </ol>
        </div>
      </nav>
      <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            {seo.h1}
          </h1>
          <p className="mt-4 text-zinc-600 sm:text-lg">
            {seo.intro}
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
          <section className="grid gap-6 sm:grid-cols-2" itemScope itemType="https://schema.org/ItemList">
            {posts.map((post, index) => (
              <div key={post.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <meta itemProp="position" content={String(index + 1)} />
                <BlogCard post={post} />
              </div>
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
