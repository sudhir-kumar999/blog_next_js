import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { markdownToHtml } from "@/lib/markdown/markdownToHtml";
import BlogContent from "@/components/BlogContent";

export const revalidate = 60; // ISR – SEO friendly

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

/* ======================================================
   STATIC PARAMS (SSG)
====================================================== */
export async function generateStaticParams() {
  const { data, error } = await supabaseServer
    .from("posts")
    .select("slug")
    .eq("published", true);

  if (error || !data) return [];

  return data.map((post) => ({
    slug: post.slug,
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

  const { data: post } = await supabaseServer
    .from("posts")
    .select(`
      title,
      excerpt,
      seo_title,
      seo_description,
      featured_image,
      published_at,
      updated_at,
      categories (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) {
    return {
      title: "Post not found",
      description: "This post does not exist",
    };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const url = `${baseUrl}/blog/${slug}`;
  const category = post.categories?.[0];

  return {
    title,
    description,
    keywords: category?.name ? [category.name] : [],
    authors: [{ name: "Your Blog" }],
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      section: category?.name,
      images: post.featured_image ? [post.featured_image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featured_image ? [post.featured_image] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

/* ======================================================
   PAGE COMPONENT
====================================================== */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: post, error } = await supabaseServer
    .from("posts")
    .select(`
      *,
      categories (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !post) {
    notFound();
  }

  const htmlContent = markdownToHtml(post.content);
  const category = post.categories?.[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      "@type": "Organization",
      name: "Your Blog",
    },
    publisher: {
      "@type": "Organization",
      name: "Your Blog",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <nav className="border-b border-zinc-100 bg-zinc-50/50 py-3">
          <div className="mx-auto max-w-3xl px-6">
            <ol
              className="flex items-center gap-2 text-sm text-zinc-600"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link href="/" itemProp="item">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>

              <li>/</li>

              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link href="/blog" itemProp="item">
                  <span itemProp="name">Blog</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>

              {category && (
                <>
                  <li>/</li>
                  <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <Link href={`/category/${category.slug}`} itemProp="item">
                      <span itemProp="name">{category.name}</span>
                    </Link>
                    <meta itemProp="position" content="3" />
                  </li>
                </>
              )}

              <li>/</li>

              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span itemProp="name">{post.title}</span>
                <meta itemProp="position" content="4" />
              </li>
            </ol>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
          <article itemScope itemType="https://schema.org/BlogPosting">
            <meta
              itemProp="mainEntityOfPage"
              content={`${baseUrl}/blog/${slug}`}
            />

            <header className="mb-10 border-b border-zinc-100 pb-8">
              {category && (
                <div className="mb-4">
                  <Link
                    href={`/category/${category.slug}`}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                  >
                    {category.name}
                  </Link>
                </div>
              )}

              <h1
                className="text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl"
                itemProp="headline"
              >
                {post.title}
              </h1>

              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="mt-6 w-full rounded-2xl object-cover"
                  loading="eager"
                  itemProp="image"
                />
              )}

              {post.excerpt && (
                <p
                  className="mt-4 text-lg text-zinc-600 leading-relaxed"
                  itemProp="description"
                >
                  {post.excerpt}
                </p>
              )}
            </header>

            <div itemProp="articleBody">
              <BlogContent html={htmlContent} />
            </div>
          </article>
        </main>
      </div>
    </>
  );
}
