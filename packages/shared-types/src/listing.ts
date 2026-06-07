import { z } from "zod";
import { paginationQuerySchema } from "./common";
import { categoryKeySchema, unitTypeSchema } from "./enums";

/** Mijoz tomonida listinglarni qidirish/filtrlash */
export const searchListingsSchema = paginationQuerySchema.extend({
  category: categoryKeySchema.default("hotel"),
  city: z.string().optional(),
  q: z.string().optional(),
  /** Bron oralig'i (mehmonxona uchun check-in / check-out) */
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  guests: z.coerce.number().int().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  /** Geo-radius qidiruv (km) */
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(0).max(200).optional(),
  sort: z.enum(["price_asc", "price_desc", "rating", "newest"]).default("newest"),
});
export type SearchListingsQuery = z.infer<typeof searchListingsSchema>;

/** Bron birligi (xona/stol/slot) — public ko'rinish */
export const bookableUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  unitType: unitTypeSchema,
  capacity: z.number().int().positive(),
  basePrice: z.number().nonnegative(),
  attributes: z.record(z.unknown()).default({}),
});
export type BookableUnitView = z.infer<typeof bookableUnitSchema>;

/** Listing — public ko'rinish (qidiruv kartochkasi + sahifa) */
export const listingSchema = z.object({
  id: z.string(),
  categoryKey: categoryKeySchema,
  title: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  photos: z.array(z.string()).default([]),
  attributes: z.record(z.unknown()).default({}),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  minPrice: z.number().nonnegative().nullable(),
  units: z.array(bookableUnitSchema).optional(),
});
export type ListingView = z.infer<typeof listingSchema>;

/** Vendor tomonida listing yaratish/yangilash */
export const upsertListingSchema = z.object({
  categoryKey: categoryKeySchema,
  title: z.string().min(3).max(120),
  description: z.string().max(5000).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(80).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photos: z.array(z.string().url()).max(20).default([]),
  attributes: z.record(z.unknown()).default({}),
});
export type UpsertListingDto = z.infer<typeof upsertListingSchema>;

/** Bron birligini yaratish/yangilash */
export const upsertUnitSchema = z.object({
  name: z.string().min(1).max(120),
  unitType: unitTypeSchema,
  capacity: z.number().int().positive().default(1),
  basePrice: z.number().nonnegative(),
  attributes: z.record(z.unknown()).default({}),
});
export type UpsertUnitDto = z.infer<typeof upsertUnitSchema>;
