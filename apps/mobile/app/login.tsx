import { useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { colors, font, gradients } from "@/theme/tokens";
import { requestOtp, verifyOtp } from "@/lib/auth-api";
import { signInWithGoogle, isGoogleAvailable } from "@/lib/google-auth";
import { useAuthStore } from "@/store/auth";

const GOOGLE_AVAILABLE = isGoogleAvailable();

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [digits, setDigits] = useState(""); // 9 raqam
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone = `+998${digits}`;

  const finishLogin = async (user: Parameters<typeof signIn>[0], tokens: Parameters<typeof signIn>[1]) => {
    await signIn(user, tokens);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const googleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res) await finishLogin(res.user, res.tokens);
    } catch {
      setError("Google bilan kirishda xato. Qayta urinib ko'ring.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendOtp = async () => {
    if (digits.length !== 9) return setError("To'liq raqam kiriting");
    setError(null);
    setLoading(true);
    try {
      const res = await requestOtp(phone);
      setDevCode(res.devCode);
      if (res.devCode) setCode(res.devCode);
      setStep("otp");
    } catch {
      setError("Kod yuborishda xato. Internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (code.length !== 6) return setError("6 xonali kodni kiriting");
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(phone, code, name.trim() || undefined);
      await signIn(res.user, res.tokens);
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch {
      setError("Kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <Pressable onPress={() => (step === "otp" ? setStep("phone") : router.back())} hitSlop={8} className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.16)" }}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <View className="mt-5 h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
          <Ionicons name="bed" size={28} color={colors.goldLight} />
        </View>
        <Text weight="bold" className="mt-4 text-[24px] text-white">
          {step === "phone" ? "Xush kelibsiz!" : "Tasdiqlash kodi"}
        </Text>
        <Text className="mt-1 text-[14px]" style={{ color: "rgba(255,255,255,0.8)" }}>
          {step === "phone" ? "Davom etish uchun telefon raqamingizni kiriting" : `${phone} raqamiga yuborilgan kodni kiriting`}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="flex-1 px-5 pt-7">
          {step === "phone" ? (
            <>
              <Text weight="medium" className="mb-2 text-[13px] text-muted">
                Telefon raqami
              </Text>
              <View className="flex-row items-center rounded-2xl bg-surface px-4" style={{ height: 58, borderWidth: 1, borderColor: colors.line }}>
                <Text weight="semibold" className="text-[16px] text-ink">
                  +998
                </Text>
                <View className="mx-3 h-6 w-px" style={{ backgroundColor: colors.line }} />
                <TextInput
                  value={digits}
                  onChangeText={(t) => setDigits(t.replace(/\D/g, "").slice(0, 9))}
                  placeholder="90 123 45 67"
                  placeholderTextColor={colors.subtle}
                  keyboardType="phone-pad"
                  autoFocus
                  style={{ flex: 1, fontFamily: font.semibold, fontSize: 16, color: colors.ink, letterSpacing: 1 }}
                />
              </View>
            </>
          ) : (
            <>
              <Text weight="medium" className="mb-2 text-[13px] text-muted">
                Tasdiqlash kodi
              </Text>
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                placeholderTextColor={colors.subtle}
                keyboardType="number-pad"
                autoFocus
                style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, height: 58, fontFamily: font.bold, fontSize: 24, color: colors.ink, textAlign: "center", letterSpacing: 12 }}
              />
              {devCode && (
                <Text className="mt-2 text-center text-[12px] text-subtle">
                  Dev rejimi · kod: {devCode}
                </Text>
              )}
              <Text weight="medium" className="mb-2 mt-5 text-[13px] text-muted">
                Ismingiz (ixtiyoriy)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="To'liq ism"
                placeholderTextColor={colors.subtle}
                style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, height: 54, paddingHorizontal: 16, fontFamily: font.regular, fontSize: 15, color: colors.ink }}
              />
            </>
          )}

          {error && (
            <View className="mt-3 flex-row items-center" style={{ gap: 6 }}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text className="text-[13px]" style={{ color: colors.danger }}>
                {error}
              </Text>
            </View>
          )}
        </View>

        <View className="px-5" style={{ paddingBottom: insets.bottom + 16 }}>
          {step === "phone" ? (
            <>
              {GOOGLE_AVAILABLE && (
                <>
                  <Pressable
                    onPress={googleLogin}
                    disabled={googleLoading}
                    className="flex-row items-center justify-center rounded-2xl bg-surface"
                    style={{ height: 56, gap: 10, borderWidth: 1, borderColor: colors.line, opacity: googleLoading ? 0.6 : 1 }}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="logo-google" size={20} color="#EA4335" />
                        <Text weight="semibold" className="text-[15.5px] text-ink">
                          Google bilan kirish
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <View className="my-4 flex-row items-center" style={{ gap: 10 }}>
                    <View className="h-px flex-1" style={{ backgroundColor: colors.line }} />
                    <Text className="text-[12px] text-subtle">yoki telefon orqali</Text>
                    <View className="h-px flex-1" style={{ backgroundColor: colors.line }} />
                  </View>
                </>
              )}

              <Button label="Davom etish" iconRight="arrow-forward" loading={loading} onPress={sendOtp} />
            </>
          ) : (
            <Button label="Tasdiqlash" icon="shield-checkmark" loading={loading} onPress={verify} />
          )}
          <Text className="mt-3 text-center text-[11.5px] text-subtle">
            Davom etish orqali siz Foydalanish shartlariga rozilik bildirasiz
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
