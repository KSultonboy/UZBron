import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, shadow } from "@/theme/tokens";
import type { IconName } from "@/data/hotels";

const FAQ = [
  { q: "Bronni qanday bekor qilaman?", a: "“Bronlarim” bo'limiga o'ting, kerakli bronni tanlang va “Bekor qilish” tugmasini bosing. Bekor qilish shartlari mehmonxonaga bog'liq." },
  { q: "To'lovni qanday amalga oshiraman?", a: "Hozircha to'lov mehmonxonada joyda amalga oshiriladi. Tez orada Payme va Click orqali ilovada to'lov qo'shiladi." },
  { q: "Bron tasdiqlanganini qayerdan bilaman?", a: "Bron tasdiqlangach bildirishnoma keladi va “Bronlarim”da holati “Faol” bo'lib ko'rinadi." },
  { q: "Mehmonxona narxiga nimalar kiradi?", a: "Ko'rsatilgan narx bir kecha uchun. Xizmat haqi (5%) bron rasmiylashtirishda alohida ko'rsatiladi." },
];

const CONTACTS: { key: string; icon: IconName; label: string; value: string; bg: string; fg: string }[] = [
  { key: "tg", icon: "paper-plane-outline", label: "Telegram", value: "@uzbooking_support", bg: "#E6F1FF", fg: "#0088CC" },
  { key: "call", icon: "call-outline", label: "Qo'ng'iroq", value: "+998 71 200 00 00", bg: "#E6F6EF", fg: colors.success },
  { key: "mail", icon: "mail-outline", label: "Email", value: "help@uzbooking.uz", bg: colors.goldSoft, fg: colors.gold },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Yordam markazi" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        {/* Aloqa */}
        <Text weight="bold" className="mb-3 text-[13px] text-muted">
          BIZ BILAN BOG'LANISH
        </Text>
        <View className="flex-row" style={{ gap: 10 }}>
          {CONTACTS.map((c) => (
            <Pressable key={c.key} className="flex-1 items-center rounded-2xl bg-surface px-2 py-4" style={shadow.soft}>
              <View className="items-center justify-center rounded-full" style={{ width: 46, height: 46, backgroundColor: c.bg }}>
                <Ionicons name={c.icon} size={21} color={c.fg} />
              </View>
              <Text weight="semibold" className="mt-2 text-[13px] text-ink">
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* FAQ */}
        <Text weight="bold" className="mb-3 mt-7 text-[13px] text-muted">
          KO'P BERILADIGAN SAVOLLAR
        </Text>
        <View style={{ gap: 10 }}>
          {FAQ.map((item, i) => {
            const isOpen = open === String(i);
            return (
              <Pressable
                key={i}
                onPress={() => setOpen(isOpen ? null : String(i))}
                className="rounded-2xl bg-surface p-4"
                style={shadow.soft}
              >
                <View className="flex-row items-center">
                  <Text weight="semibold" className="flex-1 text-[14.5px] text-ink" style={{ lineHeight: 20 }}>
                    {item.q}
                  </Text>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
                </View>
                {isOpen && (
                  <Text className="mt-2.5 text-[13.5px] text-muted" style={{ lineHeight: 20 }}>
                    {item.a}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
