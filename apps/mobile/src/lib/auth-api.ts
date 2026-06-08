// Auth API chaqiruvlari (store'dan ajratilgan — aylanma importdan qochish uchun).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useAuthStore } from "@/store/auth";
import type {
  AuthMe, AuthTokens, AuthUser, ProfileGender,
} from "@uzbooking/shared-types";

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export function requestOtp(phone: string) {
  return api.post<{ sent: true; devCode?: string }>(
    "/auth/request-otp",
    { phone },
    { auth: false },
  );
}

export function verifyOtp(phone: string, code: string, name?: string) {
  return api.post<AuthResult>(
    "/auth/verify-otp",
    { phone, code, ...(name ? { name } : {}) },
    { auth: false },
  );
}

/** Email+parol bilan kirish. Biznes akkaunt bo'lsa kod talab qilinadi. */
export interface PasswordLoginResult {
  requiresEmailCode?: boolean;
  email?: string;
  devCode?: string;
  user?: AuthUser;
  tokens?: AuthTokens;
}

export function loginWithPassword(email: string, password: string) {
  return api.post<PasswordLoginResult>(
    "/auth/login",
    { email, password },
    { auth: false },
  );
}

export function verifyEmailCode(email: string, code: string) {
  return api.post<AuthResult>(
    "/auth/login/email-verify",
    { email, code },
    { auth: false },
  );
}

export type MeResult = AuthMe;

export interface UpdateMeInput {
  name?: string | null;
  email?: string | null;
  birthday?: string | null;
  gender?: ProfileGender | null;
}

export const AUTH_ME_QUERY_KEY = ["auth-me"] as const;

export function fetchMe() {
  return api.get<MeResult>("/auth/me");
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    enabled,
    queryFn: fetchMe,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (input: UpdateMeInput) => api.patch<MeResult>("/auth/me", input),
    onSuccess: (me) => {
      void updateUser(me);
      void qc.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
  });
}

/** Hisobni butunlay o'chirish (Play talabi) — so'ngra avtomatik chiqish. */
export function useDeleteAccount() {
  const qc = useQueryClient();
  const signOut = useAuthStore((s) => s.signOut);

  return useMutation({
    mutationFn: () => api.delete<{ ok: true }>("/auth/me"),
    onSuccess: async () => {
      await signOut();
      qc.clear();
    },
  });
}
