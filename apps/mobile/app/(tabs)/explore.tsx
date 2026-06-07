import { useState, useMemo } from "react";
import { View, Pressable, FlatList, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { Chip } from "@/components/ui/primitives";
import { HotelListCard } from "@/components/HotelCard";
import { colors, font, shadow } from "@/theme/tokens";
import { useListings, type ListingsQuery } from "@/lib/listings";

const FILTERS = ["Barchasi", "5 yulduz", "Basseyn", "Nonushta", "Spa"] as const;
const FILTER_AMENITY: Record<string, string> = { Basseyn: "pool", Nonushta: "breakfast", Spa: "spa" };
const SORTS = [
  { key: "rating", label: "Reyting" },
  { key: "price_asc", label: "Arzon" },
  { key: "price_desc", label: "Qimmat" },
] as const;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("Barchasi");
  const [sort, setSort] = useState<ListingsQuery["sort"]>("rating");

  const { data, isLoading } = useListings({ category: "hotel", q: query, sort });

  // Qidiruv/saralash serverda; yulduz/qulaylik chiplari mijoz tomonda
  const results = useMemo(() => {
    let list = data?.items ?? [];
    if (filter === "5 yulduz") list = list.filter((h) => h.stars === 5);
    else if (FILTER_AMENITY[filter])
      list = list.filter((h) => h.amenities.some((a) => a.key === FILTER_AMENITY[filter]));
    return list;
  }, [data, filter]);

  return (
    <View className="flex-1 bg-canvas">
      {/* ===== Sticky header ===== */}
      <View
        className="bg-surface px-5"
        style={[{ paddingTop: insets.top + 8, paddingBottom: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, shadow.soft]}
      >
        <Text weight="bold" className="text-[22px] text-ink">
          Qidiruv
        </Text>

        <View
          className="mt-3 flex-row items-center rounded-2xl px-4"
          style={{ height: 50, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line }}
        >
          <Ionicons name="search" size={19} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Shahar yoki mehmonxona..."
            placeholderTextColor={colors.subtle}
            style={{ flex: 1, marginLeft: 10, fontFamily: font.regular, fontSize: 15, color: colors.ink }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.subtle} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12 }}
        >
          {FILTERS.map((f) => (
            <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>

      {/* ===== Natijalar ===== */}
      <FlatList
        data={results}
        keyExtractor={(h) => h.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-[13.5px] text-muted">
              <Text weight="semibold" className="text-[13.5px] text-ink">
                {results.length} ta
              </Text>{" "}
              natija topildi
            </Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Ionicons name="swap-vertical" size={15} color={colors.muted} />
              {SORTS.map((srt) => (
                <Pressable key={srt.key} onPress={() => setSort(srt.key)} hitSlop={4}>
                  <Text
                    weight={sort === srt.key ? "semibold" : "regular"}
                    className="text-[13px]"
                    style={{ color: sort === srt.key ? colors.primary : colors.muted }}
                  >
                    {srt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => <HotelListCard hotel={item} />}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center pt-24">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View className="items-center pt-20">
              <Ionicons name="bed-outline" size={48} color={colors.subtle} />
              <Text weight="semibold" className="mt-3 text-[16px] text-muted">
                Hech narsa topilmadi
              </Text>
              <Text className="mt-1 text-[13px] text-subtle">Boshqa so'rovni sinab ko'ring</Text>
            </View>
          )
        }
      />
    </View>
  );
}
