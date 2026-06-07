import { View, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { HotelListCard } from "@/components/HotelCard";
import { colors } from "@/theme/tokens";
import { useFavoritesStore } from "@/store/favorites";
import { useListings } from "@/lib/listings";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ids = useFavoritesStore((s) => s.ids);
  const { data, isLoading } = useListings({ category: "hotel" });

  const saved = (data?.items ?? []).filter((h) => ids.includes(h.id));

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Saqlanganlar" subtitle={`${saved.length} ta mehmonxona`} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : saved.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8" style={{ paddingBottom: insets.bottom + 40 }}>
          <View className="items-center justify-center rounded-full" style={{ width: 92, height: 92, backgroundColor: "#FEE7EC" }}>
            <Ionicons name="heart-outline" size={42} color={colors.danger} />
          </View>
          <Text weight="bold" className="mt-5 text-[18px] text-ink">
            Saqlanganlar bo'sh
          </Text>
          <Text className="mt-1.5 text-center text-[13.5px] text-muted" style={{ lineHeight: 20 }}>
            Yoqqan mehmonxonalarni ❤️ belgisi bilan{"\n"}saqlang va shu yerdan toping
          </Text>
          <View className="mt-6" style={{ width: 220 }}>
            <Button label="Mehmonxonalarni ko'rish" icon="search" onPress={() => router.push("/explore")} />
          </View>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(h) => h.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 12 }}
          renderItem={({ item }) => <HotelListCard hotel={item} />}
        />
      )}
    </View>
  );
}
