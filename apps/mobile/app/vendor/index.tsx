import { useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, shadow } from "@/theme/tokens";
import { useAuthStore } from "@/store/auth";
import { useVendorMe, useVendorListings, useVendorBookings, type VendorBooking, type VendorListing } from "@/lib/vendor";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
function fmt(d: string) {
  const x = new Date(d);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
}

export default function VendorDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthed = useAuthStore((s) => Boolean(s.user));
  const [tab, setTab] = useState<"listings" | "bookings">("listings");

  const { data: me } = useVendorMe(isAuthed);
  const { data: listings, isLoading: lLoading } = useVendorListings(isAuthed);
  const { data: bookings, isLoading: bLoading } = useVendorBookings(isAuthed);

  if (!isAuthed) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader title="Biznes paneli" />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="business-outline" size={56} color={colors.subtle} />
          <Text weight="bold" className="mt-4 text-[17px] text-ink">Kirish talab qilinadi</Text>
          <View className="mt-5" style={{ width: 200 }}>
            <Button label="Kirish" icon="log-in" onPress={() => router.push("/login")} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader
        title="Biznes paneli"
        subtitle={me?.name}
        right={
          <Pressable onPress={() => router.push("/vendor/new")} hitSlop={8} className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: colors.primary }}>
            <Ionicons name="add" size={24} color={colors.white} />
          </Pressable>
        }
      />

      {/* Stats */}
      <View className="flex-row px-5 pt-4" style={{ gap: 12 }}>
        <StatCard icon="home" value={me?.listingsCount ?? 0} label="E'lonlar" />
        <StatCard icon="calendar" value={bookings?.length ?? 0} label="Bronlar" />
      </View>

      {/* Segment */}
      <View className="mx-5 mt-4 flex-row rounded-2xl p-1" style={{ backgroundColor: colors.surface, ...shadow.soft }}>
        {(["listings", "bookings"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} className="flex-1 items-center justify-center rounded-xl" style={{ height: 40, backgroundColor: tab === t ? colors.primary : "transparent" }}>
            <Text weight="semibold" className="text-[13.5px]" style={{ color: tab === t ? colors.white : colors.muted }}>
              {t === "listings" ? "E'lonlarim" : "Kelgan bronlar"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 12 }}>
        {tab === "listings" ? (
          lLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : (listings ?? []).length === 0 ? (
            <EmptyHint icon="home-outline" text="Hali e'lon yo'q. Birinchi mehmonxonangizni qo'shing." onAdd={() => router.push("/vendor/new")} />
          ) : (
            (listings ?? []).map((l) => <ListingCard key={l.id} item={l} onPress={() => router.push(`/hotel/${l.id}`)} />)
          )
        ) : bLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (bookings ?? []).length === 0 ? (
          <EmptyHint icon="calendar-outline" text="Hozircha mijozlardan bron kelmagan." />
        ) : (
          (bookings ?? []).map((b) => <VendorBookingCard key={b.id} item={b} />)
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-surface p-4" style={shadow.soft}>
      <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#EEF3FC" }}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text weight="bold" className="mt-2 text-[24px] text-ink">{value}</Text>
      <Text className="text-[12px] text-muted">{label}</Text>
    </View>
  );
}

function ListingCard({ item, onPress }: { item: VendorListing; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row rounded-2xl bg-surface p-3" style={shadow.soft}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={{ width: 84, height: 84, borderRadius: 14 }} contentFit="cover" />
      ) : (
        <View className="items-center justify-center rounded-xl" style={{ width: 84, height: 84, backgroundColor: colors.canvas }}>
          <Ionicons name="image-outline" size={28} color={colors.subtle} />
        </View>
      )}
      <View className="flex-1 justify-center pl-3">
        <Text weight="bold" className="text-[15px] text-ink" numberOfLines={1}>{item.title}</Text>
        <Text className="mt-0.5 text-[12.5px] text-muted">{item.city}</Text>
        <View className="mt-1.5 flex-row" style={{ gap: 14 }}>
          <Meta icon="bed-outline" label={`${item.roomsCount} xona`} />
          <Meta icon="calendar-outline" label={`${item.bookingsCount} bron`} />
        </View>
        <Text weight="semibold" className="mt-1 text-[13px] text-primary">
          {item.minPrice.toLocaleString("ru-RU")} so'm dan
        </Text>
      </View>
    </Pressable>
  );
}

function VendorBookingCard({ item }: { item: VendorBooking }) {
  return (
    <View className="rounded-2xl bg-surface p-3.5" style={shadow.soft}>
      <View className="flex-row items-center justify-between">
        <Text weight="bold" className="flex-1 text-[14.5px] text-ink" numberOfLines={1}>{item.listingTitle}</Text>
        <Text weight="bold" className="text-[14px] text-primary">{item.totalPrice.toLocaleString("ru-RU")} so'm</Text>
      </View>
      <Text className="mt-0.5 text-[12.5px] text-muted">{item.unitName}</Text>
      <View className="mt-2.5 flex-row items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: colors.canvas }}>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#EEF3FC" }}>
            <Ionicons name="person" size={15} color={colors.primary} />
          </View>
          <View>
            <Text weight="semibold" className="text-[12.5px] text-ink">{item.guestName}</Text>
            <Text className="text-[11px] text-muted">{item.guestPhone}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text weight="medium" className="text-[12px] text-ink">{fmt(item.startDate)}{item.endDate ? ` — ${fmt(item.endDate)}` : ""}</Text>
          <Text className="text-[11px] text-muted">{item.guests} mehmon</Text>
        </View>
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <Ionicons name={icon} size={13} color={colors.muted} />
      <Text className="text-[12px] text-muted">{label}</Text>
    </View>
  );
}

function EmptyHint({ icon, text, onAdd }: { icon: keyof typeof Ionicons.glyphMap; text: string; onAdd?: () => void }) {
  return (
    <View className="items-center px-6 pt-16">
      <Ionicons name={icon} size={48} color={colors.subtle} />
      <Text className="mt-3 text-center text-[14px] text-muted" style={{ lineHeight: 20 }}>{text}</Text>
      {onAdd && (
        <View className="mt-5" style={{ width: 200 }}>
          <Button label="E'lon qo'shish" icon="add" onPress={onAdd} />
        </View>
      )}
    </View>
  );
}
