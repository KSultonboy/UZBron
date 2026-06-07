import { ScrollView, View, Pressable, FlatList, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { SectionHeader, IconCircle } from "@/components/ui/primitives";
import { FeaturedHotelCard, HotelListCard } from "@/components/HotelCard";
import { colors, gradients, shadow } from "@/theme/tokens";
import { CATEGORIES, CITIES } from "@/data/hotels";
import { useListings } from "@/lib/listings";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading } = useListings({ category: "hotel", sort: "rating" });
  const hotels = data?.items ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* ===== Hero (gradient) ===== */}
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 14,
            paddingHorizontal: 20,
            paddingBottom: 44,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                Xush kelibsiz 👋
              </Text>
              <View className="mt-0.5 flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="location" size={15} color={colors.goldLight} />
                <Text weight="semibold" className="text-[15px] text-white">
                  Toshkent, O'zbekiston
                </Text>
                <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/notifications")}
              className="items-center justify-center rounded-full"
              style={{ width: 44, height: 44, backgroundColor: "rgba(255,255,255,0.14)" }}
            >
              <Ionicons name="notifications-outline" size={21} color={colors.white} />
              <View
                className="absolute rounded-full"
                style={{ width: 8, height: 8, backgroundColor: colors.goldLight, top: 11, right: 12 }}
              />
            </Pressable>
          </View>

          <Text weight="bold" className="mt-5 text-[26px] text-white" style={{ lineHeight: 32 }}>
            Mukammal dam olishni{"\n"}bron qiling
          </Text>

          {/* Qidiruv paneli */}
          <Pressable
            onPress={() => router.push("/explore")}
            className="mt-4 flex-row items-center rounded-2xl bg-surface px-4"
            style={[{ height: 56 }, shadow.lifted]}
          >
            <Ionicons name="search" size={20} color={colors.primary} />
            <Text className="ml-3 flex-1 text-[15px] text-subtle">
              Shahar, mehmonxona qidirish...
            </Text>
            <View
              className="items-center justify-center rounded-xl"
              style={{ width: 38, height: 38, backgroundColor: colors.gold }}
            >
              <Ionicons name="options-outline" size={19} color={colors.white} />
            </View>
          </Pressable>
        </LinearGradient>

        {/* ===== Kategoriyalar ===== */}
        <View className="mt-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 22 }}
          >
            {CATEGORIES.map((c) => (
              <Pressable key={c.key} className="items-center" style={{ width: 62, opacity: c.active ? 1 : 0.45 }}>
                <IconCircle
                  name={c.icon}
                  diameter={58}
                  size={24}
                  color={c.active ? colors.primary : colors.muted}
                  bg={c.active ? "#EEF3FC" : colors.surface}
                />
                <Text
                  weight={c.active ? "semibold" : "medium"}
                  className="mt-1.5 text-center text-[11.5px]"
                  style={{ color: c.active ? colors.ink : colors.muted }}
                  numberOfLines={1}
                >
                  {c.label}
                </Text>
                {!c.active && (
                  <Text className="text-[8.5px] text-subtle">tez orada</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ===== Tavsiya etilgan ===== */}
        <View className="mt-7 px-5">
          <SectionHeader title="Tavsiya etilgan" actionLabel="Hammasi" onAction={() => router.push("/explore")} />
        </View>
        {isLoading ? (
          <View className="h-[244px] items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            horizontal
            data={hotels}
            keyExtractor={(h) => h.id}
            showsHorizontalScrollIndicator={false}
            style={{ overflow: "visible" }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 18,
              gap: 14,
            }}
            renderItem={({ item }) => <FeaturedHotelCard hotel={item} />}
          />
        )}

        {/* ===== Mashhur shaharlar ===== */}
        <View className="mt-7 px-5">
          <SectionHeader title="Mashhur shaharlar" />
          <View className="mt-3.5 flex-row flex-wrap" style={{ gap: 12 }}>
            {CITIES.map((city) => (
              <Pressable
                key={city.key}
                onPress={() => router.push("/explore")}
                style={{ width: "47.6%", borderRadius: 16, overflow: "hidden", height: 110 }}
              >
                <Image source={{ uri: city.photo }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={250} />
                <LinearGradient
                  colors={["transparent", "rgba(11,26,61,0.8)"]}
                  style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}
                />
                <View className="absolute bottom-2.5 left-3">
                  <Text weight="bold" className="text-[15px] text-white">
                    {city.name}
                  </Text>
                  <Text className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {city.count} ta joy
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ===== Siz uchun ===== */}
        <View className="mt-7 px-5">
          <SectionHeader title="Siz uchun" actionLabel="Hammasi" onAction={() => router.push("/explore")} />
          <View className="mt-3.5" style={{ gap: 12 }}>
            {hotels.slice(0, 3).map((h) => (
              <HotelListCard key={h.id} hotel={h} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
