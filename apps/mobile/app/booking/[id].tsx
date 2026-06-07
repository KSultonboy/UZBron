import { useState } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { colors, shadow } from "@/theme/tokens";
import { useListing } from "@/lib/listings";
import { useAuthStore } from "@/store/auth";
import { useCreateBooking } from "@/lib/bookings";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const WEEKDAYS = ["Yak", "Du", "Se", "Cho", "Pay", "Ju", "Sha"];
function fmt(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function BookingScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: hotel, isLoading } = useListing(id);
  const room = hotel?.rooms.find((r) => r.id === roomId) ?? hotel?.rooms[0];

  const isAuthed = useAuthStore((s) => Boolean(s.user));
  const createBooking = useCreateBooking();

  const [startOffset, setStartOffset] = useState(1); // bugundan necha kun keyin
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!hotel || !room) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Text className="text-muted">Ma'lumot topilmadi</Text>
      </View>
    );
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + startOffset);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + nights);

  const dateStrip = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return { offset: i + 1, date: d };
  });

  const subtotal = room.price * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const confirm = async () => {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    setError(null);
    try {
      await createBooking.mutateAsync({
        unitId: room.id,
        startDate: iso(checkIn),
        endDate: iso(checkOut),
        guests,
      });
      setConfirmed(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bron amalga oshmadi";
      setError(msg);
    }
  };

  // ===== Muvaffaqiyat ekrani =====
  if (confirmed) {
    return (
      <View className="flex-1 bg-canvas px-6" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 96, height: 96, backgroundColor: "#E6F6EF" }}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 66, height: 66, backgroundColor: colors.success }}
            >
              <Ionicons name="checkmark" size={38} color={colors.white} />
            </View>
          </View>
          <Text weight="bold" className="mt-6 text-center text-[23px] text-ink">
            Bron tasdiqlandi! 🎉
          </Text>
          <Text className="mt-2 text-center text-[14px] text-muted" style={{ lineHeight: 21 }}>
            {hotel.title} · {room.name}
            {"\n"}
            {fmt(checkIn)} — {fmt(checkOut)} · {guests} mehmon
          </Text>
          <View className="mt-5 rounded-2xl bg-surface px-5 py-3" style={shadow.soft}>
            <Text className="text-center text-[12px] text-muted">Jami to'lov</Text>
            <Text weight="bold" className="text-center text-[22px] text-primary">
              {total.toLocaleString("ru-RU")} so'm
            </Text>
          </View>
        </View>
        <View style={{ paddingBottom: insets.bottom + 16, gap: 10 }}>
          <Button label="Bronlarimni ko'rish" onPress={() => router.replace("/bookings")} />
          <Button label="Asosiy sahifa" variant="ghost" onPress={() => router.replace("/")} />
        </View>
      </View>
    );
  }

  // ===== Bron formasi =====
  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-surface px-5"
        style={[{ paddingTop: insets.top + 8, paddingBottom: 14 }, shadow.soft]}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: colors.canvas }}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>
        <Text weight="bold" className="text-[17px] text-ink">
          Bronni rasmiylashtirish
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        {/* Mehmonxona xulosasi */}
        <View className="flex-row rounded-2xl bg-surface p-3" style={shadow.soft}>
          <Image source={{ uri: hotel.photos[0] }} style={{ width: 80, height: 80, borderRadius: 14 }} contentFit="cover" />
          <View className="flex-1 justify-center pl-3">
            <Text weight="bold" className="text-[15px] text-ink" numberOfLines={1}>
              {hotel.title}
            </Text>
            <Text className="mt-0.5 text-[12.5px] text-muted">{room.name}</Text>
            <View className="mt-1 flex-row items-center" style={{ gap: 3 }}>
              <Ionicons name="star" size={12} color={colors.star} />
              <Text weight="semibold" className="text-[12px]">
                {hotel.rating.toFixed(1)}
              </Text>
              <Text className="text-[12px] text-muted"> · {hotel.city}</Text>
            </View>
          </View>
        </View>

        {/* Sana */}
        <Text weight="bold" className="mt-6 text-[16px] text-ink">
          Kirish sanasi
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
          {dateStrip.map((d) => {
            const active = d.offset === startOffset;
            return (
              <Pressable
                key={d.offset}
                onPress={() => setStartOffset(d.offset)}
                className="items-center justify-center rounded-2xl"
                style={{ width: 56, height: 68, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.line, ...shadow.soft }}
              >
                <Text weight="medium" className="text-[11px]" style={{ color: active ? "rgba(255,255,255,0.8)" : colors.muted }}>
                  {WEEKDAYS[d.date.getDay()]}
                </Text>
                <Text weight="bold" className="text-[18px]" style={{ color: active ? colors.white : colors.ink }}>
                  {d.date.getDate()}
                </Text>
                <Text weight="medium" className="text-[10px]" style={{ color: active ? "rgba(255,255,255,0.8)" : colors.subtle }}>
                  {MONTHS[d.date.getMonth()]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="mt-3 flex-row" style={{ gap: 12 }}>
          <DateBox label="Kirish" value={fmt(checkIn)} icon="log-in-outline" />
          <DateBox label="Chiqish" value={fmt(checkOut)} icon="log-out-outline" />
        </View>

        {/* Tunlar va mehmonlar */}
        <View className="mt-4" style={{ gap: 12 }}>
          <Stepper label="Tunlar soni" icon="moon-outline" value={nights} onChange={setNights} min={1} max={30} />
          <Stepper label="Mehmonlar" icon="people-outline" value={guests} onChange={setGuests} min={1} max={room.capacity + 2} />
        </View>

        {/* Narx tafsiloti */}
        <Text weight="bold" className="mt-6 text-[16px] text-ink">
          Narx tafsiloti
        </Text>
        <View className="mt-3 rounded-2xl bg-surface p-4" style={shadow.soft}>
          <Row label={`${room.price.toLocaleString("ru-RU")} so'm × ${nights} tun`} value={`${subtotal.toLocaleString("ru-RU")} so'm`} />
          <Row label="Xizmat haqi (5%)" value={`${serviceFee.toLocaleString("ru-RU")} so'm`} />
          <View className="my-3 h-px" style={{ backgroundColor: colors.line }} />
          <View className="flex-row items-center justify-between">
            <Text weight="bold" className="text-[15px] text-ink">
              Jami
            </Text>
            <Text weight="bold" className="text-[18px] text-primary">
              {total.toLocaleString("ru-RU")} so'm
            </Text>
          </View>
        </View>

        {/* To'lov usuli */}
        <Text weight="bold" className="mt-6 text-[16px] text-ink">
          To'lov usuli
        </Text>
        <View className="mt-3 flex-row items-center rounded-2xl bg-surface p-4" style={shadow.soft}>
          <View className="items-center justify-center rounded-xl" style={{ width: 44, height: 44, backgroundColor: colors.goldSoft }}>
            <Ionicons name="cash-outline" size={20} color={colors.gold} />
          </View>
          <View className="flex-1 pl-3">
            <Text weight="semibold" className="text-[14px] text-ink">
              Joyda to'lash
            </Text>
            <Text className="text-[12px] text-muted">Payme / Click tez orada</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
        </View>
      </ScrollView>

      {/* Sticky tasdiq */}
      <View
        className="bg-surface px-5"
        style={{ paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopLeftRadius: 24, borderTopRightRadius: 24, ...shadow.lifted }}
      >
        {error && (
          <View className="mb-2 flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="alert-circle" size={15} color={colors.danger} />
            <Text className="flex-1 text-[12.5px]" style={{ color: colors.danger }}>
              {error}
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-[11.5px] text-muted">Jami</Text>
            <Text weight="bold" className="text-[20px] text-ink">
              {total.toLocaleString("ru-RU")} so'm
            </Text>
          </View>
          <View style={{ width: 190 }}>
            <Button
              label={isAuthed ? "Tasdiqlash" : "Kirib, bron qilish"}
              icon="shield-checkmark"
              loading={createBooking.isPending}
              onPress={confirm}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function DateBox({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable className="flex-1 rounded-2xl bg-surface p-4" style={shadow.soft}>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Ionicons name={icon} size={15} color={colors.muted} />
        <Text className="text-[12px] text-muted">{label}</Text>
      </View>
      <Text weight="bold" className="mt-1.5 text-[16px] text-ink">
        {value}
      </Text>
    </Pressable>
  );
}

function Stepper({
  label,
  icon,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-surface p-4" style={shadow.soft}>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View className="items-center justify-center rounded-xl" style={{ width: 40, height: 40, backgroundColor: "#EEF3FC" }}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text weight="semibold" className="text-[14.5px] text-ink">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center" style={{ gap: 16 }}>
        <StepBtn icon="remove" disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} />
        <Text weight="bold" className="text-[16px] text-ink" style={{ minWidth: 22, textAlign: "center" }}>
          {value}
        </Text>
        <StepBtn icon="add" disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} />
      </View>
    </View>
  );
}

function StepBtn({ icon, onPress, disabled }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center justify-center rounded-full"
      style={{ width: 32, height: 32, borderWidth: 1.5, borderColor: disabled ? colors.line : colors.primary, opacity: disabled ? 0.5 : 1 }}
    >
      <Ionicons name={icon} size={17} color={disabled ? colors.subtle : colors.primary} />
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-[13.5px] text-muted">{label}</Text>
      <Text weight="medium" className="text-[13.5px] text-ink">
        {value}
      </Text>
    </View>
  );
}
