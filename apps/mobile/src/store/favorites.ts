// Saqlanganlar (wishlist) holati — Zustand + SecureStore.
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const KEY = "uzbooking.favorites";

interface FavState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (id: string) => void;
  setIds: (ids: string[]) => void;
  isFavorite: (id: string) => boolean;
}

async function persist(ids: string[]) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(ids));
  } catch {
    // jim
  }
}

export const useFavoritesStore = create<FavState>((set, get) => ({
  ids: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      set({ ids: raw ? (JSON.parse(raw) as string[]) : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  toggle: (id) => {
    const exists = get().ids.includes(id);
    const ids = exists ? get().ids.filter((x) => x !== id) : [...get().ids, id];
    set({ ids });
    void persist(ids);
  },

  setIds: (ids) => {
    set({ ids });
    void persist(ids);
  },

  isFavorite: (id) => get().ids.includes(id),
}));

/** Bitta ID uchun reaktiv favorite holati */
export function useIsFavorite(id: string): boolean {
  return useFavoritesStore((s) => s.ids.includes(id));
}
