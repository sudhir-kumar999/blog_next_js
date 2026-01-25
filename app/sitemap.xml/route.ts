// app/sitemap.xml/route.ts

import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs"; // important for server execution
export const revalidate = 0; // always fresh sitemap (no ISR cache)

export async function GET() {
  const baseUrl = "https://www.studymitra.in";

  // 🔹 Fetch only published posts
  const { data: posts, error } = await supabaseServer
    .from("posts")
    .select("slug, updated_at, published_at")
    .eq("published", true);

  if (error) {
    return new Response("Error generating sitemap", { status: 500 });
  }

  // 🔹 Static routes
  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: "1.0",
    },
    {
      url: `${baseUrl}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: "0.9",
    },
  ];

  // 🔹 Dynamic blog post routes
  const postPages =
    posts?.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastmod: new Date(
        post.updated_at || post.published_at || Date.now()
      ).toISOString(),
      changefreq: "weekly",
      priority: "0.8",
    })) || [];

  const allPages = [...staticPages, ...postPages];

  // 🔹 Generate XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
