import { z } from "zod";

/** Foydalanuvchi roli */
export const UserRole = {
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const userRoleSchema = z.nativeEnum(UserRole);

/** Profil uchun jins qiymatlari */
export const ProfileGender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;
export type ProfileGender = (typeof ProfileGender)[keyof typeof ProfileGender];
export const profileGenderSchema = z.nativeEnum(ProfileGender);

/** Biznes (vendor) holati */
export const VendorStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;
export type VendorStatus = (typeof VendorStatus)[keyof typeof VendorStatus];
export const vendorStatusSchema = z.nativeEnum(VendorStatus);

/** E'lon (listing) holati */
export const ListingStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];
export const listingStatusSchema = z.nativeEnum(ListingStatus);

/**
 * Bron birligining turi — universal abstraksiyaning yadrosi.
 * NIGHTLY: sutkalik (mehmonxona xonasi, dacha)
 * SLOT:    vaqt sloti (shifokor qabuli, sartarosh, sport maydoni)
 * TABLE:   stol/joy (restoran)
 */
export const UnitType = {
  NIGHTLY: "NIGHTLY",
  SLOT: "SLOT",
  TABLE: "TABLE",
} as const;
export type UnitType = (typeof UnitType)[keyof typeof UnitType];
export const unitTypeSchema = z.nativeEnum(UnitType);

/** Bo'sh vaqt holati */
export const AvailabilityStatus = {
  FREE: "FREE",
  BLOCKED: "BLOCKED",
} as const;
export type AvailabilityStatus =
  (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];
export const availabilityStatusSchema = z.nativeEnum(AvailabilityStatus);

/** Bron holati */
export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
export const bookingStatusSchema = z.nativeEnum(BookingStatus);

/** Vertikal (kategoriya) kalitlari — MVP: hotel. Qolganlari keyin qo'shiladi. */
export const CategoryKey = {
  HOTEL: "hotel",
  DACHA: "dacha",
  RESTAURANT: "restaurant",
  SALON: "salon",
  BARBER: "barber",
  CLINIC: "clinic",
  SPORT: "sport",
} as const;
export type CategoryKey = (typeof CategoryKey)[keyof typeof CategoryKey];
export const categoryKeySchema = z.nativeEnum(CategoryKey);
