import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, gradients, shadow } from "@/theme/tokens";
import type { IconName } from "@/data/hotels";

interface Card {
  id: string;
  brand: string;
  type: "uzcard" | "humo";
  last4: string;
  holder: string;
  primary: boolean;
}

const CARDS: Card[] = [
  { id: "c1", brand: "UZCARD", type: "uzcard", last4: "4456", holder: "SULTONBOY K.", primary: true },
  { id: "c2", brand: "HUMO", type: "humo", last4: "8812", holder: "SULTONBOY K.", primary: false },
];

const WALLETS: { key: string; label: string; icon: IconName; note: string }[] = [
  { key: "payme", label: "Payme", icon: "phone-portrait-outline", note: "Tez orada" },
  { key: "click", label: "Click", icon: "card-outline", note: "Tez orada" },
];

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="To'lov usullari" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        {/* Kartalar */}
        <Text weight="bold" className="mb-3 text-[13px] text-muted">
          KARTALARIM
        </Text>
        <View style={{ gap: 14 }}>
          {CARDS.map((card) => (
            <View key={card.id} style={shadow.card}>
              <LinearGradient
                colors={card.type === "uzcard" ? gradients.primary : gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 18, padding: 18, height: 160, justifyContent: "space-between" }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="rounded-md px-2 py-1" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <Text weight="bold" className="text-[12px] text-white">
                      {card.brand}
                    </Text>
                  </View>
                  {card.primary && (
                    <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
                      <Text weight="semibold" className="text-[10.5px] text-white">
                        Asosiy
                      </Text>
                    </View>
                  )}
                </View>
                <Text weight="bold" className="text-[19px] text-white" style={{ letterSpacing: 2 }}>
                  •••• •••• •••• {card.last4}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text weight="medium" className="text-[13px]" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {card.holder}
                  </Text>
                  <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.8)" style={{ transform: [{ rotate: "90deg" }] }} />
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Karta qo'shish */}
        <Pressable
          className="mt-4 flex-row items-center justify-center rounded-2xl py-4"
          style={{ gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderStyle: "dashed" }}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text weight="semibold" className="text-[15px] text-primary">
            Yangi karta qo'shish
          </Text>
        </Pressable>

        {/* Hamyonlar */}
        <Text weight="bold" className="mb-3 mt-7 text-[13px] text-muted">
          ELEKTRON HAMYONLAR
        </Text>
        <View className="overflow-hidden rounded-2xl bg-surface" style={shadow.soft}>
          {WALLETS.map((w, i) => (
            <View key={w.key} className="flex-row items-center px-4 py-3.5" style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
              <View className="items-center justify-center rounded-xl" style={{ width: 40, height: 40, backgroundColor: "#EEF3FC" }}>
                <Ionicons name={w.icon} size={19} color={colors.primary} />
              </View>
              <Text weight="medium" className="flex-1 pl-3 text-[14.5px] text-ink">
                {w.label}
              </Text>
              <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.goldSoft }}>
                <Text weight="semibold" className="text-[11px]" style={{ color: colors.gold }}>
                  {w.note}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
