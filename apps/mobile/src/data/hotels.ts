// Tiplar + UI kataloglari (kategoriyalar, shaharlar, qulayliklar ikonkalar xaritasi).
// Mehmonxona ma'lumotlari endi backend API'dan keladi (src/lib/listings.ts).
import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface Amenity {
  key: string;
  label: string;
  icon: IconName;
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  beds: string;
  price: number;
  size: string;
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
}

export interface Hotel {
  id: string;
  title: string;
  city: string;
  district: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  photos: string[];
  amenities: Amenity[];
  rooms: RoomType[];
  reviews: Review[];
  description: string;
  badge?: string;
  distanceKm?: number;
}

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Qulaylik kalitlari -> yorliq + ikonka (UI tomonda hal qilinadi)
export const AMENITIES: Amenity[] = [
  { key: "wifi", label: "Bepul Wi-Fi", icon: "wifi" },
  { key: "parking", label: "Avtoturargoh", icon: "car-outline" },
  { key: "pool", label: "Basseyn", icon: "water-outline" },
  { key: "breakfast", label: "Nonushta", icon: "restaurant-outline" },
  { key: "gym", label: "Sport zali", icon: "barbell-outline" },
  { key: "spa", label: "Spa", icon: "flower-outline" },
  { key: "ac", label: "Konditsioner", icon: "snow-outline" },
  { key: "bar", label: "Bar", icon: "wine-outline" },
];

const AMENITY_MAP: Record<string, Amenity> = Object.fromEntries(
  AMENITIES.map((a) => [a.key, a]),
);

/** Qulaylik kalitlarini to'liq obyektlarga aylantirish */
export function resolveAmenities(keys: string[]): Amenity[] {
  return keys
    .map((k) => AMENITY_MAP[k])
    .filter((a): a is Amenity => Boolean(a));
}

export interface CityItem {
  key: string;
  name: string;
  count: number;
  photo: string;
}

export const CITIES: CityItem[] = [
  { key: "Toshkent", name: "Toshkent", count: 248, photo: u("photo-1604999333679-b86d54738315", 500) },
  { key: "Samarqand", name: "Samarqand", count: 132, photo: u("photo-1605281317010-fe5ffe798166", 500) },
  { key: "Buxoro", name: "Buxoro", count: 87, photo: u("photo-1599661046289-e31897846e41", 500) },
  { key: "Xiva", name: "Xiva", count: 54, photo: u("photo-1631281956016-3cdc1b2fe5fb", 500) },
];

export interface ServiceCategory {
  key: string;
  label: string;
  icon: IconName;
  active: boolean;
}

export const CATEGORIES: ServiceCategory[] = [
  { key: "hotel", label: "Mehmonxona", icon: "bed-outline", active: true },
  { key: "dacha", label: "Dacha", icon: "home-outline", active: false },
  { key: "restaurant", label: "Restoran", icon: "restaurant-outline", active: false },
  { key: "salon", label: "Salon", icon: "cut-outline", active: false },
  { key: "clinic", label: "Klinika", icon: "medkit-outline", active: false },
  { key: "sport", label: "Sport", icon: "football-outline", active: false },
];
