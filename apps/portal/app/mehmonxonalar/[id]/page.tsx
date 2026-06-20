import type { Metadata } from "next";
import { SitePage } from "@/components/site-page";
import { HotelDetail } from "@/components/hotel-detail";
import { API_BASE } from "@/lib/config";

interface HotelSeo {
  id: string;
  title: string;
  description?: string;
  city?: string;
  district?: string;
  stars?: number;
  rating?: number;
  reviewCount?: number;
  price?: number;
  photos?: string[];
}

async function getHotel(id: string): Promise<HotelSeo | null> {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return (await res.json()) as HotelSeo;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const h = await getHotel(id);
  if (!h) return { title: "Mehmonxona" };
  const desc =
    h.description?.slice(0, 160) ||
    `${h.title} — ${h.city ?? "O'zbekiston"}da onlayn bron qiling. Narx, rasmlar va sharhlar UZBron'da.`;
  return {
    title: h.title,
    description: desc,
    alternates: { canonical: `/mehmonxonalar/${id}` },
    openGraph: {
      title: `${h.title} — UZBron`,
      description: desc,
      images: h.photos?.length ? [{ url: h.photos[0] }] : undefined,
      type: "website",
    },
  };
}

export default async function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = await getHotel(id);

  const jsonLd = h
    ? {
        "@context": "https://schema.org",
        "@type": "Hotel",
        name: h.title,
        description: h.description,
        image: h.photos,
        address: {
          "@type": "PostalAddress",
          addressLocality: h.city,
          addressCountry: "UZ",
        },
        ...(h.stars ? { starRating: { "@type": "Rating", ratingValue: h.stars } } : {}),
        ...(h.rating && h.reviewCount
          ? { aggregateRating: { "@type": "AggregateRating", ratingValue: h.rating, reviewCount: h.reviewCount } }
          : {}),
        ...(h.price ? { priceRange: `${h.price.toLocaleString("uz-UZ")} so'm` } : {}),
      }
    : null;

  return (
    <SitePage>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <HotelDetail id={id} />
    </SitePage>
  );
}
