import { View, Pressable, Switch, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, shadow } from "@/theme/tokens";

/** Brend rangli almashtirgich (toggle) */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#D8DEE8", true: colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#D8DEE8"
    />
  );
}

/** Sozlamalar guruhi (oq karta) */
export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="px-5">
      {title && (
        <Text weight="bold" className="mb-2.5 mt-6 text-[13px] text-muted">
          {title.toUpperCase()}
        </Text>
      )}
      <View className="overflow-hidden rounded-2xl bg-surface" style={shadow.soft}>
        {children}
      </View>
    </View>
  );
}

/** Sozlamalar qatori — ikonka + yorliq + o'ng element */
export function SettingsRow({
  icon,
  iconBg = "#EEF3FC",
  iconColor = colors.primary,
  label,
  hint,
  value,
  right,
  danger = false,
  first = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg?: string;
  iconColor?: string;
  label: string;
  hint?: string;
  value?: string;
  right?: React.ReactNode;
  danger?: boolean;
  first?: boolean;
  onPress?: PressableProps["onPress"];
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5"
      style={{ borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }}
    >
      <View
        className="items-center justify-center rounded-xl"
        style={{ width: 38, height: 38, backgroundColor: danger ? "#FEE7EC" : iconBg }}
      >
        <Ionicons name={icon} size={18} color={danger ? colors.danger : iconColor} />
      </View>
      <View className="flex-1 pl-3">
        <Text
          weight="medium"
          className="text-[14.5px]"
          style={{ color: danger ? colors.danger : colors.ink }}
        >
          {label}
        </Text>
        {hint && <Text className="text-[12px] text-muted">{hint}</Text>}
      </View>
      {value && (
        <Text weight="medium" className="mr-2 text-[13.5px] text-muted">
          {value}
        </Text>
      )}
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.subtle} />)}
    </Pressable>
  );
}
