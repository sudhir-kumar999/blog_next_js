// app/blog/[slug]/page.tsx
// SEO: Server Component + SSG/ISR. Full article HTML in initial response (no useEffect/client fetch).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { markdownToHtml } from "@/lib/markdown/markdownToHtml";
import BlogContent from "@/components/BlogContent";
import AdSenseSlot from "@/components/AdSenseSlot";
import { buildFaqPageJsonLd, extractFaqFromContent } from "@/lib/aeo";
import { ADSENSE_SLOTS } from "@/lib/adsense-config";
import { SITE_BASE_URL } from "@/lib/site-config";
import { countWords } from "@/lib/wordCount";

// export const dynamic = "force-static"; // Ensure static generation at build (not dynamic)
// export const revalidate = 60; // ISR: revalidate after 60s

// SIRF YE RAKHO:
export const revalidate = 3600; // 1 hour — stable cache
export const dynamicParams = true; // New slugs still rendered on-demand (indexable)

const baseUrl = SITE_BASE_URL;

/* ======================================================
   STATIC PARAMS (SSG)
====================================================== */
export async function generateStaticParams() {
  const { data, error } = await supabaseServer
    .from("posts")
    .select("slug")
    .eq("published", true);

  if (error || !data) return [];

  return data
    .filter((post) => post.slug && typeof post.slug === "string")
    .map((post) => ({
      slug: post.slug.trim().replace(/\s+/g, "-"),
    }))
    .filter((p) => p.slug.length > 0);
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
      robots: { index: false, follow: false },
    };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const url = `${baseUrl}/blog/${slug}`;
  const category = Array.isArray(post.categories) ? post.categories[0] : post.categories;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    keywords: category?.name ? [category.name] : [],
    authors: [{ name: "Study Mitra", url: baseUrl }],
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

  // Other posts for internal linking (helps "Crawled - not indexed" → indexed)
  const { data: otherPosts } = await supabaseServer
    .from("posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      categories ( name, slug )
    `)
    .eq("published", true)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(4);

  const faqs = extractFaqFromContent(post.content || "");
  const htmlContent = markdownToHtml(post.content);
  const category = Array.isArray(post.categories) ? post.categories[0] : post.categories;

  const postUrl = `${baseUrl}/blog/${slug}`;
  const faqJsonLd = buildFaqPageJsonLd(faqs, postUrl);
  const wordCount = countWords(post.content || "");
  const readingMinutes = Math.max(1, Math.round(wordCount / 220));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    url: postUrl,
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    wordCount: wordCount > 0 ? wordCount : undefined,
    author: {
      "@type": "Organization",
      name: "Study Mitra",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Study Mitra",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

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

        <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
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

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600">
                <time dateTime={post.published_at} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
                  {readingMinutes} min read
                </span>
                {wordCount > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
                    {wordCount.toLocaleString()} words
                  </span>
                )}
              </div>

              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="mt-7 w-full rounded-2xl border border-zinc-200 object-cover shadow-sm"
                  loading="eager"
                  itemProp="image"
                />
              ) : (
                <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white">
                  <div className="p-8 sm:p-10">
                    <p className="text-sm font-semibold text-zinc-700">StudyMitra</p>
                    <p className="mt-2 text-2xl font-bold leading-snug text-black">{post.title}</p>
                    {post.excerpt && <p className="mt-3 text-sm text-zinc-600 line-clamp-3">{post.excerpt}</p>}
                  </div>
                </div>
              )}

              {post.excerpt && (
                <p
                  className="mt-6 text-lg text-zinc-600 leading-relaxed"
                  itemProp="description"
                >
                  {post.excerpt}
                </p>
              )}
            </header>

            <div itemProp="articleBody">
              <BlogContent html={htmlContent} />
            </div>

            {wordCount >= 800 && ADSENSE_SLOTS.display ? (
              <AdSenseSlot slot={ADSENSE_SLOTS.display} format="horizontal" className="my-10" />
            ) : null}

            {wordCount >= 1200 && ADSENSE_SLOTS.inArticle ? (
              <AdSenseSlot slot={ADSENSE_SLOTS.inArticle} format="auto" className="my-10" />
            ) : null}

          </article>

          {/* More articles – internal links help Google index "Crawled - not indexed" pages */}
          {otherPosts && otherPosts.length > 0 && (
            <section className="mt-16 border-t border-zinc-200 pt-12" aria-label="More articles">
              <h2 className="text-xl font-semibold text-black mb-6">More articles</h2>
              <ul className="space-y-4">
                {otherPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {p.title}
                    </Link>
                    {p.excerpt && (
                      <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{p.excerpt}</p>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <Link href="/blog" className="text-blue-600 hover:underline font-medium">
                  View all posts →
                </Link>
              </p>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
