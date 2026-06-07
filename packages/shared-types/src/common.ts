import { z } from "zod";

/** O'zbekiston telefon raqami: +998XXXXXXXXX */
export const phoneSchema = z
  .string()
  .regex(/^\+998\d{9}$/u, "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak");

/** Ko'p tilli matn (uz/ru/en) */
export const localizedTextSchema = z.object({
  uz: z.string(),
  ru: z.string().optional(),
  en: z.string().optional(),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

/** Geo-koordinatalar */
export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

/** Sahifalash so'rovi */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Sahifalangan javob (generic) */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const SUPPORTED_LOCALES = ["uz", "ru", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
