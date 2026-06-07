import { ActivityIndicator, Pressable, View, type PressableProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, gradients, shadow } from "@/theme/tokens";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, { h: number; px: number; text: string; icon: number }> = {
  sm: { h: 40, px: 16, text: "text-[14px]", icon: 16 },
  md: { h: 52, px: 20, text: "text-[16px]", icon: 18 },
  lg: { h: 58, px: 24, text: "text-[17px]", icon: 20 },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconRight,
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const s = sizeMap[size];
  const isFilled = variant === "primary" || variant === "gold";
  const fg =
    variant === "outline" ? colors.primary : variant === "ghost" ? colors.muted : colors.white;

  const content = (
    <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={s.icon} color={fg} />}
          <Text weight="semibold" className={s.text} style={{ color: fg }}>
            {label}
          </Text>
          {iconRight && <Ionicons name={iconRight} size={s.icon} color={fg} />}
        </>
      )}
    </View>
  );

  const radius = 16;
  const baseStyle = [
    {
      height: s.h,
      borderRadius: radius,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? ("100%" as const) : undefined,
    },
    isFilled ? shadow.soft : undefined,
    style as object,
  ];

  if (isFilled) {
    return (
      <Pressable disabled={disabled || loading} style={baseStyle} {...props}>
        <LinearGradient
          colors={variant === "gold" ? gradients.gold : gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: radius,
            paddingHorizontal: s.px,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={disabled || loading}
      style={[
        ...baseStyle,
        {
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: s.px,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: colors.primary,
          backgroundColor: variant === "ghost" ? "transparent" : colors.white,
        },
      ]}
      {...props}
    >
      {content}
    </Pressable>
  );
}
