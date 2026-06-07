import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore, useIsFavorite } from "@/store/favorites";
import { useAuthStore } from "@/store/auth";
import { serverToggleFavorite } from "@/lib/favorites-api";
import { colors } from "@/theme/tokens";

function useToggleFavorite() {
  const toggle = useFavoritesStore((s) => s.toggle);
  return (id: string) => {
    const wasFav = useFavoritesStore.getState().ids.includes(id);
    toggle(id);
    if (useAuthStore.getState().user) serverToggleFavorite(id, !wasFav);
  };
}

/** Wishlist toggle tugmasi — favorites store bilan ulangan */
export function HeartButton({
  id,
  size = 18,
  variant = "solid",
}: {
  id: string;
  size?: number;
  variant?: "solid" | "plain";
}) {
  const fav = useIsFavorite(id);
  const toggle = useToggleFavorite();

  if (variant === "plain") {
    return (
      <Pressable onPress={() => toggle(id)} hitSlop={8}>
        <Ionicons
          name={fav ? "heart" : "heart-outline"}
          size={size}
          color={fav ? colors.danger : colors.subtle}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => toggle(id)}
      hitSlop={6}
      className="items-center justify-center rounded-full"
      style={{ width: size + 16, height: size + 16, backgroundColor: "rgba(255,255,255,0.92)" }}
    >
      <Ionicons
        name={fav ? "heart" : "heart-outline"}
        size={size}
        color={fav ? colors.danger : colors.ink}
      />
    </Pressable>
  );
}
