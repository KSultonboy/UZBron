import { useState } from "react";
import { View, Pressable, ScrollView, ActivityIndicator, Modal, TextInput } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { colors, font, shadow } from "@/theme/tokens";
import { useAuthStore } from "@/store/auth";
import { useMyBookings, useCancelBooking, useCreateReview, type BookingView } from "@/lib/bookings";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
function fmtRange(start: string, end: string | null): string {
  const s = new Date(start);
  const text = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  if (!end) return text(s);
  return `${text(s)} — ${text(new Date(end))}`;
}

const STATUS_META: Record<string, { label: string; bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  CONFIRMED: { label: "Faol", bg: "#E6F1FF", fg: colors.primary, icon: "checkmark-circle-outline" },
  PENDING: { label: "Kutilmoqda", bg: colors.goldSoft, fg: colors.gold, icon: "time-outline" },
  COMPLETED: { label: "Yakunlangan", bg: "#E6F6EF", fg: colors.success, icon: "checkmark-done-outline" },
  CANCELLED: { label: "Bekor qilingan", bg: "#FEE7EC", fg: colors.danger, icon: "close-circle-outline" },
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthed = useAuthStore((s) => Boolean(s.user));
  const [tab, setTab] = useState<"active" | "past">("active");
  const [reviewFor, setReviewFor] = useState<BookingView | null>(null);

  const { data: bookings, isLoading } = useMyBookings(isAuthed);

  const items = (bookings ?? []).filter((b) =>
    tab === "active" ? ["PENDING", "CONFIRMED"].includes(b.status) : ["COMPLETED", "CANCELLED"].includes(b.status),
  );

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View
        className="bg-surface px-5"
        style={[{ paddingTop: insets.top + 8, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, shadow.soft]}
      >
        <Text weight="bold" className="text-[22px] text-ink">
          Mening bronlarim
        </Text>
        <View className="mt-3 flex-row rounded-2xl p-1" style={{ backgroundColor: colors.canvas }}>
          {(["active", "past"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className="flex-1 items-center justify-center rounded-xl"
              style={{ height: 40, backgroundColor: tab === t ? colors.surface : "transparent", ...(tab === t ? shadow.soft : {}) }}
            >
              <Text weight={tab === t ? "semibold" : "medium"} className="text-[14px]" style={{ color: tab === t ? colors.primary : colors.muted }}>
                {t === "active" ? "Faol" : "O'tgan"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!isAuthed ? (
        <Empty
          icon="lock-closed-outline"
          title="Kirish talab qilinadi"
          subtitle={"Bronlaringizni ko'rish uchun\nhisobingizga kiring"}
          actionLabel="Kirish"
          actionIcon="log-in"
          onAction={() => router.push("/login")}
        />
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <Empty
          icon="calendar-outline"
          title="Hozircha bron yo'q"
          subtitle={"Mehmonxona tanlab, birinchi\nbroningizni rasmiylashtiring"}
          actionLabel="Qidirishni boshlash"
          actionIcon="search"
          onAction={() => router.push("/explore")}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 28, gap: 14 }}>
          {items.map((b) => (
            <BookingCard key={b.id} item={b} onReview={() => setReviewFor(b)} />
          ))}
        </ScrollView>
      )}

      <ReviewModal booking={reviewFor} onClose={() => setReviewFor(null)} />
    </View>
  );
}

function Empty({ icon, title, subtitle, actionLabel, actionIcon, onAction }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string;
  actionLabel: string; actionIcon: keyof typeof Ionicons.glyphMap; onAction: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="items-center justify-center rounded-full" style={{ width: 88, height: 88, backgroundColor: "#EEF3FC" }}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text weight="bold" className="mt-4 text-[17px] text-ink">{title}</Text>
      <Text className="mt-1 text-center text-[13.5px] text-muted" style={{ lineHeight: 20 }}>{subtitle}</Text>
      <View className="mt-5" style={{ width: 220 }}>
        <Button label={actionLabel} icon={actionIcon} onPress={onAction} />
      </View>
    </View>
  );
}

function BookingCard({ item, onReview }: { item: BookingView; onReview: () => void }) {
  const router = useRouter();
  const cancel = useCancelBooking();
  const meta = STATUS_META[item.status] ?? STATUS_META.CONFIRMED;

  return (
    <View className="rounded-2xl bg-surface p-3" style={shadow.card}>
      <Pressable className="flex-row" onPress={() => router.push(`/hotel/${item.listingId}`)}>
        {item.listingPhoto && (
          <Image source={{ uri: item.listingPhoto }} style={{ width: 92, height: 92, borderRadius: 14 }} contentFit="cover" transition={200} />
        )}
        <View className="flex-1 pl-3">
          <View className="flex-row items-start justify-between">
            <Text weight="bold" className="flex-1 text-[15px] text-ink" numberOfLines={1}>
              {item.listingTitle}
            </Text>
            <View className="flex-row items-center rounded-full px-2 py-1" style={{ gap: 3, backgroundColor: meta.bg }}>
              <Ionicons name={meta.icon} size={11} color={meta.fg} />
              <Text weight="semibold" className="text-[10.5px]" style={{ color: meta.fg }}>{meta.label}</Text>
            </View>
          </View>
          <Text className="mt-0.5 text-[12.5px] text-muted">{item.unitName}</Text>
          <View className="mt-2 flex-row items-center" style={{ gap: 12 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="calendar-outline" size={13} color={colors.muted} />
              <Text className="text-[12px] text-muted">{fmtRange(item.startDate, item.endDate)}</Text>
            </View>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="people-outline" size={13} color={colors.muted} />
              <Text className="text-[12px] text-muted">{item.guests}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      <View className="mt-3 flex-row items-center justify-between border-t pt-3" style={{ borderTopColor: colors.line }}>
        <View>
          <Text className="text-[11px] text-muted">Jami · {item.nights} tun</Text>
          <Text weight="bold" className="text-[15px] text-ink">{item.totalPrice.toLocaleString("ru-RU")} so'm</Text>
        </View>
        {["PENDING", "CONFIRMED"].includes(item.status) ? (
          <Pressable
            onPress={() => cancel.mutate(item.id)}
            disabled={cancel.isPending}
            className="rounded-xl px-3.5 py-2"
            style={{ borderWidth: 1.5, borderColor: colors.line }}
          >
            <Text weight="semibold" className="text-[12.5px]" style={{ color: colors.danger }}>
              {cancel.isPending ? "..." : "Bekor qilish"}
            </Text>
          </Pressable>
        ) : item.status === "COMPLETED" ? (
          <Pressable onPress={onReview} className="flex-row items-center rounded-xl px-3.5 py-2" style={{ gap: 5, backgroundColor: colors.goldSoft }}>
            <Ionicons name="star" size={13} color={colors.gold} />
            <Text weight="semibold" className="text-[12.5px]" style={{ color: colors.gold }}>Sharh qoldirish</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push(`/hotel/${item.listingId}`)} className="rounded-xl px-3.5 py-2" style={{ backgroundColor: colors.primary }}>
            <Text weight="semibold" className="text-[12.5px] text-white">Qayta bron</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ReviewModal({ booking, onClose }: { booking: BookingView | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = async () => {
    if (!booking) return;
    try {
      await createReview.mutateAsync({ bookingId: booking.id, rating, comment: comment.trim() || undefined });
      setComment("");
      setRating(5);
      onClose();
    } catch {
      // jim — modal ochiq qoladi
    }
  };

  return (
    <Modal visible={Boolean(booking)} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(11,26,61,0.5)" }}>
        <View className="bg-surface px-5 pt-5" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom + 16 }}>
          <View className="mb-3 items-center">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: colors.line }} />
          </View>
          <Text weight="bold" className="text-[18px] text-ink">Sharh qoldiring</Text>
          <Text className="mt-1 text-[13px] text-muted">{booking?.listingTitle}</Text>

          <View className="mt-4 flex-row justify-center" style={{ gap: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={4}>
                <Ionicons name={n <= rating ? "star" : "star-outline"} size={34} color={colors.star} />
              </Pressable>
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Taassurotlaringiz bilan o'rtoqlashing..."
            placeholderTextColor={colors.subtle}
            multiline
            style={{ marginTop: 16, minHeight: 90, backgroundColor: colors.canvas, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, fontFamily: font.regular, fontSize: 14, color: colors.ink, textAlignVertical: "top" }}
          />

          <View className="mt-4 flex-row" style={{ gap: 10 }}>
            <View className="flex-1">
              <Button label="Bekor" variant="ghost" onPress={onClose} />
            </View>
            <View className="flex-1">
              <Button label="Yuborish" icon="send" loading={createReview.isPending} onPress={submit} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
