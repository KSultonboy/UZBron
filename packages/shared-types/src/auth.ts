import { z } from "zod";
import { phoneSchema } from "./common";
import { profileGenderSchema, userRoleSchema } from "./enums";

/** 1-qadam: telefonga OTP yuborish so'rovi */
export const requestOtpSchema = z.object({
  phone: phoneSchema,
});
export type RequestOtpDto = z.infer<typeof requestOtpSchema>;

/** 2-qadam: OTP tasdiqlash (ro'yxat/kirish bitta oqimda) */
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "Kod 6 xonali bo'lishi kerak"),
  /** Birinchi marta kirgan foydalanuvchi uchun ism (ixtiyoriy) */
  name: z.string().min(2).max(60).optional(),
});
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  birthday: z.string().nullable().optional(),
  gender: profileGenderSchema.nullable().optional(),
  name: z.string().nullable(),
  role: userRoleSchema,
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const profileStatsSchema = z.object({
  bookingsCount: z.number().int().nonnegative(),
  favoritesCount: z.number().int().nonnegative(),
  reviewsCount: z.number().int().nonnegative(),
  averageRating: z.number().nullable(),
});
export type ProfileStats = z.infer<typeof profileStatsSchema>;

export const authMeSchema = authUserSchema.extend({
  vendorId: z.string().nullable(),
  stats: profileStatsSchema,
});
export type AuthMe = z.infer<typeof authMeSchema>;

export const updateMeSchema = z.object({
  name: z.string().min(2).max(60).nullable().optional(),
  email: z.string().email().nullable().optional(),
  birthday: z.string().nullable().optional(),
  gender: profileGenderSchema.nullable().optional(),
});
export type UpdateMeDto = z.infer<typeof updateMeSchema>;

export const authResponseSchema = z.object({
  user: authUserSchema,
  tokens: authTokensSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
