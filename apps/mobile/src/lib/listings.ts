// Backend listings API — fetcherlar + TanStack Query hooklari.
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { resolveAmenities, type Hotel, type RoomType, type Review } from "@/data/hotels";

// ===== API javob shakllari =====
interface ApiHotel {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  photos: string[];
  badge?: string | null;
  distanceKm?: number | null;
  amenities: string[];
  rooms: RoomType[];
  reviews?: Review[];
}

interface ApiCategory {
  key: string;
  nameUz: string;
  nameRu: string | null;
  nameEn: string | null;
  icon: string | null;
  active: boolean;
}

/** API hotel -> ilova Hotel tipi (qulayliklarni ikonkali obyektga aylantirish) */
function mapHotel(h: ApiHotel): Hotel {
  return {
    id: h.id,
    title: h.title,
    city: h.city,
    district: h.district,
    stars: h.stars,
    rating: h.rating,
    reviewCount: h.reviewCount,
    price: h.price,
    photos: h.photos,
    description: h.description,
    badge: h.badge ?? undefined,
    distanceKm: h.distanceKm ?? undefined,
    amenities: resolveAmenities(h.amenities ?? []),
    rooms: h.rooms ?? [],
    reviews: h.reviews ?? [],
  };
}

export interface ListingsQuery {
  category?: string;
  q?: string;
  city?: string;
  sort?: "rating" | "price_asc" | "price_desc" | "newest";
}

function buildQuery(params: ListingsQuery): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  if (params.city) sp.set("city", params.city);
  if (params.sort) sp.set("sort", params.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ===== Hooklar =====
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ items: ApiCategory[] }>("/categories", { auth: false }),
    select: (d) => d.items,
    staleTime: 5 * 60_000,
  });
}

export function useListings(params: ListingsQuery = {}) {
  return useQuery({
    queryKey: ["listings", params],
    queryFn: async () => {
      const res = await api.get<{ items: ApiHotel[]; total: number }>(
        `/listings${buildQuery(params)}`,
        { auth: false },
      );
      return { items: res.items.map(mapHotel), total: res.total };
    },
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const h = await api.get<ApiHotel>(`/listings/${id}`, { auth: false });
      return mapHotel(h);
    },
  });
}
