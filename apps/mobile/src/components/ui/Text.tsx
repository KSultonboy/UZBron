// DM Sans standart shriftli Text. Vazn `weight` prop orqali, rang/o'lcham className orqali.
import { Text as RNText, type TextProps } from "react-native";
import { font } from "@/theme/tokens";

type Weight = "regular" | "medium" | "semibold" | "bold";

export interface AppTextProps extends TextProps {
  weight?: Weight;
  className?: string;
}

export function Text({
  weight = "regular",
  className,
  style,
  ...props
}: AppTextProps) {
  return (
    <RNText
      style={[{ fontFamily: font[weight] }, style]}
      className={`text-ink ${className ?? ""}`}
      {...props}
    />
  );
}
