import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/auth/",
          "/api/",
          "/_next/",
          "/*?q=",
          "/*?utm_",
          "/*?ref=",
        ],
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
      },
    ],
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  };
}
