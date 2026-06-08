import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors } from "@/theme/tokens";

// Bildirishnomalar backend (push) keyin qo'shiladi. Hozircha real ma'lumot yo'q —
// foydalanuvchiga soxta ma'lumot ko'rsatmaymiz, toza bo'sh holat ko'rsatamiz.
export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Bildirishnomalar" />

      <View className="flex-1 items-center justify-center px-10">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 92, height: 92, backgroundColor: "#EEF3FC" }}
        >
          <Ionicons name="notifications-outline" size={42} color={colors.primary} />
        </View>
        <Text weight="bold" className="mt-6 text-[18px] text-ink">
          Hozircha bildirishnoma yo'q
        </Text>
        <Text className="mt-2 text-center text-[14px] text-muted" style={{ lineHeight: 21 }}>
          Bronlaringiz, maxsus takliflar va eslatmalar shu yerda ko'rinadi.
        </Text>
      </View>
    </View>
  );
}
