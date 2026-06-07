// Bron + sharh API hooklari.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface BookingView {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  listingId: string;
  listingTitle: string;
  listingPhoto: string | null;
  city: string | null;
  unitId: string;
  unitName: string;
  startDate: string;
  endDate: string | null;
  nights: number;
  guests: number;
  totalPrice: number;
  note: string | null;
  createdAt: string;
}

export interface CreateBookingInput {
  unitId: string;
  startDate: string;
  endDate?: string;
  guests: number;
  note?: string;
}

export function useMyBookings(enabled = true) {
  return useQuery({
    queryKey: ["my-bookings"],
    enabled,
    queryFn: () => api.get<{ items: BookingView[] }>("/bookings"),
    select: (d) => d.items,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => api.post<BookingView>("/bookings", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<BookingView>(`/bookings/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; rating: number; comment?: string }) =>
      api.post<{ ok: true }>("/reviews", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
}
