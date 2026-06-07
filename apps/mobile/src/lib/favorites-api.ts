// Wishlist server sync (faqat kirgan foydalanuvchi uchun).
import { useEffect } from "react";
import { api } from "./api";
import { queryClient } from "./queryClient";
import { useAuthStore } from "@/store/auth";
import { useFavoritesStore } from "@/store/favorites";

export async function fetchFavoriteIds(): Promise<string[]> {
  const res = await api.get<{ ids: string[] }>("/favorites");
  return res.ids;
}

/** Serverga toggle (fire-and-forget) */
export function serverToggleFavorite(id: string, nowFavorite: boolean) {
  const promise = nowFavorite
    ? api.post(`/favorites/${id}`)
    : api.delete(`/favorites/${id}`);
  void promise.then(() => queryClient.invalidateQueries({ queryKey: ["auth-me"] })).catch(() => {
    // jim — offline bo'lsa local holat saqlanadi
  });
}

/** Kirilganda server wishlistini local store bilan birlashtirish */
export function useFavoritesSync() {
  const userId = useAuthStore((s) => s.user?.id);
  const setIds = useFavoritesStore((s) => s.setIds);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void (async () => {
      try {
        const serverIds = await fetchFavoriteIds();
        if (!active) return;
        const local = useFavoritesStore.getState().ids;
        const merged = Array.from(new Set([...serverIds, ...local]));
        setIds(merged);
        // Local'dagi (lekin serverda yo'q) larni serverga yuborish
        for (const id of local) {
          if (!serverIds.includes(id)) serverToggleFavorite(id, true);
        }
      } catch {
        // jim
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, setIds]);
}
