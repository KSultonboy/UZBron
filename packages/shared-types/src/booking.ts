import { z } from "zod";
import { bookingStatusSchema } from "./enums";

/**
 * Bron yaratish. NIGHTLY uchun startDate/endDate (sutkalar),
 * SLOT/TABLE uchun startDate + startTime/endTime ishlatiladi.
 */
export const createBookingSchema = z
  .object({
    unitId: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date().optional(),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/u, "HH:MM formatida")
      .optional(),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/u, "HH:MM formatida")
      .optional(),
    guests: z.number().int().positive().default(1),
    note: z.string().max(500).optional(),
  })
  .refine(
    (v) => !v.endDate || v.endDate >= v.startDate,
    { message: "endDate startDate'dan keyin bo'lishi kerak", path: ["endDate"] },
  );
export type CreateBookingDto = z.infer<typeof createBookingSchema>;

export const bookingSchema = z.object({
  id: z.string(),
  status: bookingStatusSchema,
  listingId: z.string(),
  listingTitle: z.string(),
  unitId: z.string(),
  unitName: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  guests: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type BookingView = z.infer<typeof bookingSchema>;

/** Vendor bronni tasdiqlash/rad etish */
export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});
export type UpdateBookingStatusDto = z.infer<typeof updateBookingStatusSchema>;

/** Sharh yaratish */
export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
export type CreateReviewDto = z.infer<typeof createReviewSchema>;
