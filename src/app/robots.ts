import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/wp-json/", "/wc-api/"],
    },
    sitemap: "https://minifimy.com/sitemap.xml",
  };
}
