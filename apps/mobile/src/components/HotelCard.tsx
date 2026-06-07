import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "./ui/Text";
import { Badge, PriceTag, RatingStars } from "./ui/primitives";
import { HeartButton } from "./ui/HeartButton";
import { colors, shadow, gradients } from "@/theme/tokens";
import type { Hotel } from "@/data/hotels";

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

/** Katta "featured" kartochka — gorizontal karusel uchun */
export function FeaturedHotelCard({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/hotel/${hotel.id}`)}
      style={[{ width: 280, borderRadius: 20 }, shadow.card]}
      className="bg-surface"
    >
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <View>
          <Image
            source={{ uri: hotel.photos[0] }}
            placeholder={blurhash}
            transition={250}
            style={{ width: "100%", height: 180 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={gradients.imageScrim}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90 }}
          />
          <View className="absolute left-3 top-3 flex-row" style={{ gap: 6 }}>
            {hotel.badge && <Badge label={hotel.badge} tone="gold" icon="flame" />}
          </View>
          <View className="absolute right-3 top-3">
            <HeartButton id={hotel.id} size={18} />
          </View>
          <View className="absolute bottom-3 left-3 right-3">
            <Text weight="bold" className="text-[17px] text-white" numberOfLines={1}>
              {hotel.title}
            </Text>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.85)" />
              <Text className="text-[12px]" style={{ color: "rgba(255,255,255,0.9)" }}>
                {hotel.city} · {hotel.district}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-between px-3.5 py-3">
          <PriceTag price={hotel.price} size="md" />
          <RatingStars rating={hotel.rating} reviewCount={hotel.reviewCount} compact />
        </View>
      </View>
    </Pressable>
  );
}

/** Gorizontal "list" kartochka — qidiruv natijalari uchun */
export function HotelListCard({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/hotel/${hotel.id}`)}
      style={[{ borderRadius: 18 }, shadow.soft]}
      className="flex-row bg-surface p-2.5"
    >
      <View style={{ borderRadius: 14, overflow: "hidden" }}>
        <Image
          source={{ uri: hotel.photos[0] }}
          placeholder={blurhash}
          transition={250}
          style={{ width: 116, height: 116 }}
          contentFit="cover"
        />
        {hotel.badge && (
          <View className="absolute left-1.5 top-1.5">
            <Badge label={hotel.badge} tone="light" />
          </View>
        )}
      </View>
      <View className="flex-1 justify-between pl-3 py-0.5">
        <View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 3 }}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Ionicons key={i} name="star" size={10} color={colors.gold} />
              ))}
            </View>
            <HeartButton id={hotel.id} variant="plain" size={18} />
          </View>
          <Text weight="bold" className="mt-1 text-[15.5px] text-ink" numberOfLines={1}>
            {hotel.title}
          </Text>
          <View className="mt-0.5 flex-row items-center" style={{ gap: 3 }}>
            <Ionicons name="location-outline" size={12} color={colors.muted} />
            <Text className="text-[12.5px] text-muted" numberOfLines={1}>
              {hotel.district}
              {hotel.distanceKm ? ` · ${hotel.distanceKm} km` : ""}
            </Text>
          </View>
          <View className="mt-1.5">
            <RatingStars rating={hotel.rating} reviewCount={hotel.reviewCount} compact />
          </View>
        </View>
        <View className="flex-row items-end justify-between">
          <PriceTag price={hotel.price} size="sm" />
          <View
            className="items-center justify-center rounded-xl"
            style={{ width: 34, height: 34, backgroundColor: colors.primary }}
          >
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
