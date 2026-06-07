import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, shadow } from "@/theme/tokens";
import type { IconName } from "@/data/hotels";

interface Notif {
  id: string;
  type: "booking" | "promo" | "reminder" | "review" | "payment";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const TYPE_META: Record<Notif["type"], { icon: IconName; bg: string; fg: string }> = {
  booking: { icon: "checkmark-circle", bg: "#E6F6EF", fg: colors.success },
  promo: { icon: "pricetag", bg: colors.goldSoft, fg: colors.gold },
  reminder: { icon: "alarm", bg: "#EEF3FC", fg: colors.primary },
  review: { icon: "star", bg: colors.goldSoft, fg: colors.gold },
  payment: { icon: "card", bg: "#EEF3FC", fg: colors.primary },
};

const DATA: { section: string; items: Notif[] }[] = [
  {
    section: "Bugun",
    items: [
      { id: "n1", type: "booking", title: "Bron tasdiqlandi 🎉", body: "Hilton Tashkent City · Deluxe xona · 12–14 Iyun", time: "10:24", unread: true },
      { id: "n2", type: "promo", title: "Maxsus chegirma!", body: "Samarqand mehmonxonalariga 20% chegirma. Faqat bugun.", time: "09:10", unread: true },
    ],
  },
  {
    section: "Kechagi",
    items: [
      { id: "n3", type: "reminder", title: "Sayohatingiz yaqinlashmoqda", body: "Registon Plaza'ga 3 kun qoldi. Tayyormisiz?", time: "18:42", unread: false },
      { id: "n4", type: "payment", title: "To'lov qabul qilindi", body: "1 953 000 so'm · Registon Plaza broni uchun", time: "15:05", unread: false },
    ],
  },
  {
    section: "Avval",
    items: [
      { id: "n5", type: "review", title: "Sharh qoldiring", body: "Bukhara Palace'dagi dam olishingiz qanday o'tdi?", time: "2 kun oldin", unread: false },
    ],
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(DATA);

  const markAllRead = () =>
    setItems((prev) => prev.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, unread: false })) })));

  const hasUnread = items.some((g) => g.items.some((i) => i.unread));

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader
        title="Bildirishnomalar"
        right={
          hasUnread ? (
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text weight="semibold" className="text-[12.5px] text-primary">
                Hammasini o'qish
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        {items.map((group) => (
          <View key={group.section} className="mb-5">
            <Text weight="bold" className="mb-2.5 text-[13px] text-muted">
              {group.section}
            </Text>
            <View style={{ gap: 10 }}>
              {group.items.map((n) => {
                const meta = TYPE_META[n.type];
                return (
                  <View
                    key={n.id}
                    className="flex-row rounded-2xl bg-surface p-3.5"
                    style={[shadow.soft, n.unread ? { borderWidth: 1, borderColor: "#DCE6F8" } : null]}
                  >
                    <View className="items-center justify-center rounded-xl" style={{ width: 44, height: 44, backgroundColor: meta.bg }}>
                      <Ionicons name={meta.icon} size={20} color={meta.fg} />
                    </View>
                    <View className="flex-1 pl-3">
                      <View className="flex-row items-center justify-between">
                        <Text weight="semibold" className="flex-1 text-[14.5px] text-ink" numberOfLines={1}>
                          {n.title}
                        </Text>
                        {n.unread && <View className="ml-2 rounded-full" style={{ width: 8, height: 8, backgroundColor: colors.primary }} />}
                      </View>
                      <Text className="mt-0.5 text-[12.5px] text-muted" style={{ lineHeight: 18 }} numberOfLines={2}>
                        {n.body}
                      </Text>
                      <Text className="mt-1 text-[11px] text-subtle">{n.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
