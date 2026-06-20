import type { MetadataRoute } from "next";
import { API_BASE } from "@/lib/config";

const SITE = "https://uzbron.uz";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/mehmonxonalar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/bizneslar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/haqida`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/aloqa`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/maxfiylik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/shartlar`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let hotels: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/listings?limit=200`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = (await res.json()) as { items?: { id: string }[] };
      hotels = (data.items ?? []).map((h) => ({
        url: `${SITE}/mehmonxonalar/${h.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    /* API yo'q bo'lsa — faqat statik sahifalar */
  }

  return [...staticRoutes, ...hotels];
}
