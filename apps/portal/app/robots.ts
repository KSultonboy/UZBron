import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/uzbron-admin-x9k2", "/uzbron-partner-7f3", "/dashboard", "/bronlarim"],
    },
    sitemap: "https://uzbron.uz/sitemap.xml",
    host: "https://uzbron.uz",
  };
}
