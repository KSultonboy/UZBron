// Biznes paneli (vendor) API hooklari.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface VendorMe {
  id: string;
  name: string;
  status: string;
  listingsCount: number;
}

export interface VendorListing {
  id: string;
  title: string;
  city: string | null;
  photo: string | null;
  status: string;
  roomsCount: number;
  bookingsCount: number;
  minPrice: number;
}

export interface VendorBooking {
  id: string;
  status: string;
  listingTitle: string;
  photo: string | null;
  unitName: string;
  guestName: string;
  guestPhone: string | null;
  startDate: string;
  endDate: string | null;
  guests: number;
  totalPrice: number;
}

export interface CreateListingInput {
  title: string;
  city: string;
  district?: string;
  description?: string;
  stars: number;
  basePrice: number;
  photos?: string[];
  amenities?: string[];
}

export function useVendorMe(enabled = true) {
  return useQuery({
    queryKey: ["vendor-me"],
    enabled,
    queryFn: () => api.get<VendorMe>("/vendor/me"),
  });
}

export function useVendorListings(enabled = true) {
  return useQuery({
    queryKey: ["vendor-listings"],
    enabled,
    queryFn: () => api.get<{ items: VendorListing[] }>("/vendor/listings"),
    select: (d) => d.items,
  });
}

export function useVendorBookings(enabled = true) {
  return useQuery({
    queryKey: ["vendor-bookings"],
    enabled,
    queryFn: () => api.get<{ items: VendorBooking[] }>("/vendor/bookings"),
    select: (d) => d.items,
  });
}

export function useCreateVendorListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) => api.post<{ id: string }>("/vendor/listings", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-listings"] });
      qc.invalidateQueries({ queryKey: ["vendor-me"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
