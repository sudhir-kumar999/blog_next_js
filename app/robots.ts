import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/api/"],
      },
    ],
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  };
}
