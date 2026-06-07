// Auth holati — Zustand + expo-secure-store (token xavfsiz saqlanadi).
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthTokens, AuthUser } from "@uzbooking/shared-types";

const TOKENS_KEY = "uzbooking.tokens";
const USER_KEY = "uzbooking.user";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (user: AuthUser, tokens: AuthTokens) => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [rawTokens, rawUser] = await Promise.all([
        SecureStore.getItemAsync(TOKENS_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      set({
        tokens: rawTokens ? (JSON.parse(rawTokens) as AuthTokens) : null,
        user: rawUser ? (JSON.parse(rawUser) as AuthUser) : null,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  signIn: async (user, tokens) => {
    set({ user, tokens }); // holatni darhol o'rnatamiz
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens)),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
      ]);
    } catch {
      // web/qo'llab-quvvatlanmagan muhitda jim o'tamiz (faqat seans)
    }
  },

  updateUser: async (user) => {
    set({ user });
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch {
      // jim
    }
  },

  signOut: async () => {
    set({ user: null, tokens: null });
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKENS_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    } catch {
      // jim
    }
  },
}));
