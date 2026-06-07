// Kichik qayta ishlatiladigan primitive komponentlar.
import { View, Pressable, type ViewProps, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, shadow } from "@/theme/tokens";

/** Oq kartochka — yumshoq soya bilan */
export function Card({ style, className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface rounded-2xl ${className ?? ""}`}
      style={[shadow.card, style]}
      {...props}
    />
  );
}

/** Rangli doiradagi ikonka */
export function IconCircle({
  name,
  size = 20,
  color = colors.primary,
  bg = "#EEF3FC",
  diameter = 44,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  bg?: string;
  diameter?: number;
}) {
  return (
    <View
      style={{
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

/** Reyting yulduzlari + raqam */
export function RatingStars({
  rating,
  reviewCount,
  compact = false,
}: {
  rating: number;
  reviewCount?: number;
  compact?: boolean;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <Ionicons name="star" size={compact ? 13 : 15} color={colors.star} />
      <Text weight="semibold" className={compact ? "text-[13px]" : "text-[14px]"}>
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined && (
        <Text className="text-muted" weight="regular">
          {compact ? `(${reviewCount})` : ` · ${reviewCount} sharh`}
        </Text>
      )}
    </View>
  );
}

/** Tanlanadigan chip (filtr/kategoriya) */
export function Chip({
  label,
  active = false,
  icon,
  onPress,
}: {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: PressableProps["onPress"];
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-full px-4"
      style={{
        height: 38,
        gap: 6,
        backgroundColor: active ? colors.primary : colors.white,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.line,
      }}
    >
      {icon && (
        <Ionicons name={icon} size={15} color={active ? colors.white : colors.muted} />
      )}
      <Text
        weight={active ? "semibold" : "medium"}
        className="text-[13.5px]"
        style={{ color: active ? colors.white : colors.muted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Yengil rangli yorliq (badge) */
export function Badge({
  label,
  icon,
  tone = "gold",
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: "gold" | "primary" | "success" | "light";
}) {
  const tones = {
    gold: { bg: colors.goldSoft, fg: colors.gold },
    primary: { bg: "#EEF3FC", fg: colors.primary },
    success: { bg: "#E6F6EF", fg: colors.success },
    light: { bg: "rgba(255,255,255,0.92)", fg: colors.ink },
  } as const;
  const t = tones[tone];
  return (
    <View
      className="flex-row items-center self-start rounded-full px-2.5"
      style={{ height: 26, gap: 4, backgroundColor: t.bg }}
    >
      {icon && <Ionicons name={icon} size={12} color={t.fg} />}
      <Text weight="semibold" className="text-[11.5px]" style={{ color: t.fg }}>
        {label}
      </Text>
    </View>
  );
}

/** Bo'lim sarlavhasi + "Hammasi" havolasi */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: PressableProps["onPress"];
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text weight="bold" className="text-[19px] text-ink">
        {title}
      </Text>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={8} className="flex-row items-center" style={{ gap: 2 }}>
          <Text weight="semibold" className="text-[13.5px] text-primary">
            {actionLabel}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

/** Narx ko'rsatkichi — so'm/kecha */
export function PriceTag({
  price,
  unit = "kecha",
  size = "md",
}: {
  price: number;
  unit?: string;
  size?: "sm" | "md" | "lg";
}) {
  const map = { sm: "text-[15px]", md: "text-[18px]", lg: "text-[24px]" } as const;
  return (
    <View className="flex-row items-baseline" style={{ gap: 3 }}>
      <Text weight="bold" className={`${map[size]} text-ink`}>
        {price.toLocaleString("ru-RU")}
      </Text>
      <Text weight="medium" className="text-[12px] text-muted">
        so'm / {unit}
      </Text>
    </View>
  );
}
