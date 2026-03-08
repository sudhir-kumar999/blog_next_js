import { supabaseServer } from "@/lib/supabase/server";
import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

const staticPages: MetadataRoute.Sitemap = [
  { url: SITE_BASE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
  { url: `${SITE_BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
  { url: `${SITE_BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  { url: `${SITE_BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  { url: `${SITE_BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  { url: `${SITE_BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  { url: `${SITE_BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_BASE_URL;

  let postUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const [postsRes, categoriesRes] = await Promise.all([
      supabaseServer.from("posts").select("slug, updated_at").eq("published", true),
      supabaseServer.from("categories").select("slug"),
    ]);

    const safeSlug = (s: string) => (s || "").trim().replace(/\s+/g, "-");
    postUrls =
      postsRes.data
        ?.filter((post) => post.slug && safeSlug(post.slug).length > 0)
        .map((post) => ({
          url: `${baseUrl}/blog/${safeSlug(post.slug)}`,
          lastModified: new Date(post.updated_at || Date.now()),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })) ?? [];

    categoryUrls =
      categoriesRes.data
        ?.filter((cat) => cat.slug && safeSlug(cat.slug).length > 0)
        .map((cat) => ({
          url: `${baseUrl}/category/${safeSlug(cat.slug)}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })) ?? [];
  } catch {
    // If Supabase fails, return at least static pages so sitemap never 500s
  }

  return [...staticPages, ...postUrls, ...categoryUrls];
}
