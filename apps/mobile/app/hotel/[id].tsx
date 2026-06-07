import { useState, useEffect } from "react";
import { View, Pressable, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge, RatingStars } from "@/components/ui/primitives";
import { HeartButton } from "@/components/ui/HeartButton";
import { colors, shadow } from "@/theme/tokens";
import { type RoomType } from "@/data/hotels";
import { useListing } from "@/lib/listings";

const { width } = Dimensions.get("window");
const IMG_H = 330;

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: hotel, isLoading } = useListing(id);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

  useEffect(() => {
    if (hotel && !selectedRoom) setSelectedRoom(hotel.rooms[0] ?? null);
  }, [hotel, selectedRoom]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Text className="text-muted">Mehmonxona topilmadi</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ===== Galereya ===== */}
        <View style={{ height: IMG_H }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))
            }
          >
            {hotel.photos.map((p, i) => (
              <Image key={i} source={{ uri: p }} style={{ width, height: IMG_H }} contentFit="cover" transition={200} />
            ))}
          </ScrollView>
          <LinearGradient
            colors={["rgba(11,26,61,0.45)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 110 }}
          />
          {/* Top bar */}
          <View
            className="absolute left-0 right-0 flex-row items-center justify-between px-5"
            style={{ top: insets.top + 6 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="items-center justify-center rounded-full"
              style={{ width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.92)" }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.92)" }}>
                <Ionicons name="share-outline" size={20} color={colors.ink} />
              </Pressable>
              <HeartButton id={hotel.id} size={20} />
            </View>
          </View>
          {/* Dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center" style={{ gap: 6 }}>
            {hotel.photos.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeImg ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === activeImg ? colors.white : "rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </View>
        </View>

        {/* ===== Asosiy ma'lumot ===== */}
        <View
          className="bg-canvas px-5 pt-5"
          style={{ marginTop: -22, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 4 }}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Ionicons key={i} name="star" size={13} color={colors.gold} />
              ))}
              <Text weight="medium" className="ml-1 text-[12.5px] text-muted">
                {hotel.stars} yulduzli mehmonxona
              </Text>
            </View>
            {hotel.badge && <Badge label={hotel.badge} tone="gold" icon="flame" />}
          </View>

          <Text weight="bold" className="mt-2 text-[24px] text-ink" style={{ lineHeight: 30 }}>
            {hotel.title}
          </Text>
          <View className="mt-1.5 flex-row items-center" style={{ gap: 5 }}>
            <Ionicons name="location-outline" size={15} color={colors.muted} />
            <Text className="text-[13.5px] text-muted">
              {hotel.district}, {hotel.city}
            </Text>
          </View>

          {/* Reyting kartasi */}
          <View
            className="mt-4 flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3"
            style={shadow.soft}
          >
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <View
                className="items-center justify-center rounded-xl"
                style={{ width: 46, height: 46, backgroundColor: colors.primary }}
              >
                <Text weight="bold" className="text-[17px] text-white">
                  {hotel.rating.toFixed(1)}
                </Text>
              </View>
              <View>
                <Text weight="semibold" className="text-[14px] text-ink">
                  Ajoyib
                </Text>
                <Text className="text-[12px] text-muted">{hotel.reviewCount} ta sharh asosida</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
          </View>

          {/* Qulayliklar */}
          <Text weight="bold" className="mt-6 text-[18px] text-ink">
            Qulayliklar
          </Text>
          <View className="mt-3 flex-row flex-wrap" style={{ gap: 10 }}>
            {hotel.amenities.map((a) => (
              <View
                key={a.key}
                className="flex-row items-center rounded-xl bg-surface px-3 py-2.5"
                style={[{ gap: 8 }, shadow.soft]}
              >
                <Ionicons name={a.icon} size={17} color={colors.primary} />
                <Text weight="medium" className="text-[13px] text-ink">
                  {a.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Tavsif */}
          <Text weight="bold" className="mt-6 text-[18px] text-ink">
            Tavsif
          </Text>
          <Text className="mt-2 text-[14px] text-muted" style={{ lineHeight: 22 }}>
            {hotel.description}
          </Text>

          {/* Xonalar */}
          <Text weight="bold" className="mt-6 text-[18px] text-ink">
            Xona turini tanlang
          </Text>
          <View className="mt-3" style={{ gap: 11 }}>
            {hotel.rooms.map((room) => {
              const active = selectedRoom?.id === room.id;
              return (
                <Pressable
                  key={room.id}
                  onPress={() => setSelectedRoom(room)}
                  className="rounded-2xl bg-surface p-4"
                  style={[
                    shadow.soft,
                    { borderWidth: 1.5, borderColor: active ? colors.primary : "transparent" },
                  ]}
                >
                  <View className="flex-row items-center justify-between">
                    <Text weight="bold" className="text-[15.5px] text-ink">
                      {room.name}
                    </Text>
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 22,
                        height: 22,
                        borderWidth: 2,
                        borderColor: active ? colors.primary : colors.line,
                        backgroundColor: active ? colors.primary : "transparent",
                      }}
                    >
                      {active && <Ionicons name="checkmark" size={13} color={colors.white} />}
                    </View>
                  </View>
                  <View className="mt-2 flex-row items-center" style={{ gap: 14 }}>
                    <Meta icon="bed-outline" label={room.beds} />
                    <Meta icon="people-outline" label={`${room.capacity} kishi`} />
                    <Meta icon="resize-outline" label={room.size} />
                  </View>
                  <View className="mt-3 flex-row items-baseline" style={{ gap: 3 }}>
                    <Text weight="bold" className="text-[18px] text-primary">
                      {room.price.toLocaleString("ru-RU")}
                    </Text>
                    <Text weight="medium" className="text-[12px] text-muted">
                      so'm / kecha
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Sharhlar */}
          <View className="mt-6 flex-row items-center justify-between">
            <Text weight="bold" className="text-[18px] text-ink">
              Sharhlar
            </Text>
            <RatingStars rating={hotel.rating} reviewCount={hotel.reviewCount} compact />
          </View>
          <View className="mt-3" style={{ gap: 11 }}>
            {hotel.reviews.map((rev) => (
              <View key={rev.id} className="rounded-2xl bg-surface p-4" style={shadow.soft}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center" style={{ gap: 10 }}>
                    <View
                      className="items-center justify-center rounded-full"
                      style={{ width: 38, height: 38, backgroundColor: "#EEF3FC" }}
                    >
                      <Text weight="bold" className="text-[13px] text-primary">
                        {rev.initials}
                      </Text>
                    </View>
                    <View>
                      <Text weight="semibold" className="text-[13.5px] text-ink">
                        {rev.author}
                      </Text>
                      <Text className="text-[11.5px] text-subtle">{rev.date}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center" style={{ gap: 3 }}>
                    <Ionicons name="star" size={13} color={colors.star} />
                    <Text weight="semibold" className="text-[13px]">
                      {rev.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text className="mt-2.5 text-[13.5px] text-muted" style={{ lineHeight: 20 }}>
                  {rev.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ===== Sticky bron paneli ===== */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center bg-surface px-5"
        style={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          ...shadow.lifted,
        }}
      >
        <View className="flex-1">
          <Text className="text-[11.5px] text-muted">Boshlanish narxi</Text>
          <View className="flex-row items-baseline" style={{ gap: 3 }}>
            <Text weight="bold" className="text-[21px] text-ink">
              {(selectedRoom?.price ?? hotel.price).toLocaleString("ru-RU")}
            </Text>
            <Text weight="medium" className="text-[12px] text-muted">
              so'm / kecha
            </Text>
          </View>
        </View>
        <View style={{ width: 180 }}>
          <Button
            label="Bron qilish"
            iconRight="arrow-forward"
            onPress={() =>
              router.push({ pathname: "/booking/[id]", params: { id: hotel.id, roomId: selectedRoom?.id ?? "" } })
            }
          />
        </View>
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text className="text-[12px] text-muted">{label}</Text>
    </View>
  );
}
