import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "./Text";
import { colors, shadow } from "@/theme/tokens";

/** Ichki sahifalar uchun standart sarlavha paneli (orqaga + sarlavha + ixtiyoriy o'ng element) */
export function ScreenHeader({
  title,
  subtitle,
  right,
  flat = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  flat?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View
      className="flex-row items-center bg-surface px-5"
      style={[
        {
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          borderBottomLeftRadius: flat ? 0 : 22,
          borderBottomRightRadius: flat ? 0 : 22,
        },
        flat ? { borderBottomWidth: 1, borderBottomColor: colors.line } : shadow.soft,
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        className="items-center justify-center rounded-full"
        style={{ width: 40, height: 40, backgroundColor: colors.canvas }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>
      <View className="flex-1 px-3">
        <Text weight="bold" className="text-[18px] text-ink" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-[12.5px] text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? <View style={{ width: 40 }} />}
    </View>
  );
}
