import { useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { colors, font, gradients } from "@/theme/tokens";
import {
  requestOtp,
  verifyOtp,
  loginWithPassword,
  verifyEmailCode,
} from "@/lib/auth-api";
import { signInWithGoogle, isGoogleAvailable } from "@/lib/google-auth";
import { useAuthStore } from "@/store/auth";

const GOOGLE_AVAILABLE = isGoogleAvailable();

type Step = "email" | "email-code" | "phone" | "otp";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const [step, setStep] = useState<Step>("email");

  // Email + parol
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailDevCode, setEmailDevCode] = useState<string | undefined>();

  // Telefon OTP
  const [digits, setDigits] = useState("");
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

  // Email + parol bilan kirish
  const submitEmail = async () => {
    const e = email.trim().toLowerCase();
    if (!e.includes("@") || password.length < 6) {
      return setError("Email va parolni to'g'ri kiriting");
    }
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithPassword(e, password);
      if (res.requiresEmailCode) {
        // Biznes akkaunt — emailga kod yuborildi
        setPendingEmail(res.email ?? e);
        setEmailDevCode(res.devCode);
        if (res.devCode) setEmailCode(res.devCode);
        setStep("email-code");
      } else if (res.user && res.tokens) {
        await finishLogin(res.user, res.tokens);
      } else {
        setError("Kirishda xato. Qayta urinib ko'ring.");
      }
    } catch {
      setError("Email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  // Biznes 2FA: email kodni tasdiqlash
  const submitEmailCode = async () => {
    if (emailCode.length !== 6) return setError("6 xonali kodni kiriting");
    setError(null);
    setLoading(true);
    try {
      const res = await verifyEmailCode(pendingEmail, emailCode);
      await finishLogin(res.user, res.tokens);
    } catch {
      setError("Kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setLoading(false);
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
      await finishLogin(res.user, res.tokens);
    } catch {
      setError("Kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError(null);
    if (step === "otp") setStep("phone");
    else if (step === "phone") setStep("email");
    else if (step === "email-code") setStep("email");
    else router.back();
  };

  const heading: Record<Step, { title: string; sub: string }> = {
    email: { title: "Xush kelibsiz!", sub: "Davom etish uchun hisobingizga kiring" },
    "email-code": { title: "Tasdiqlash kodi", sub: `${pendingEmail} manziliga yuborilgan kodni kiriting` },
    phone: { title: "Telefon orqali kirish", sub: "Telefon raqamingizni kiriting" },
    otp: { title: "Tasdiqlash kodi", sub: `${phone} raqamiga yuborilgan kodni kiriting` },
  };

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <Pressable onPress={goBack} hitSlop={8} className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.16)" }}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <View className="mt-5 h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
          <Ionicons name="bed" size={28} color={colors.goldLight} />
        </View>
        <Text weight="bold" className="mt-4 text-[24px] text-white">
          {heading[step].title}
        </Text>
        <Text className="mt-1 text-[14px]" style={{ color: "rgba(255,255,255,0.8)" }}>
          {heading[step].sub}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="flex-1 px-5 pt-7">
          {step === "email" && (
            <>
              <Text weight="medium" className="mb-2 text-[13px] text-muted">Email</Text>
              <View className="flex-row items-center rounded-2xl bg-surface px-4" style={{ height: 56, borderWidth: 1, borderColor: colors.line }}>
                <Ionicons name="mail-outline" size={19} color={colors.subtle} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@misol.com"
                  placeholderTextColor={colors.subtle}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ flex: 1, marginLeft: 10, fontFamily: font.medium, fontSize: 15.5, color: colors.ink }}
                />
              </View>

              <Text weight="medium" className="mb-2 mt-4 text-[13px] text-muted">Parol</Text>
              <View className="flex-row items-center rounded-2xl bg-surface px-4" style={{ height: 56, borderWidth: 1, borderColor: colors.line }}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.subtle} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.subtle}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  style={{ flex: 1, marginLeft: 10, fontFamily: font.medium, fontSize: 15.5, color: colors.ink }}
                />
                <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
                  <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={colors.subtle} />
                </Pressable>
              </View>
            </>
          )}

          {step === "email-code" && (
            <>
              <Text weight="medium" className="mb-2 text-[13px] text-muted">Tasdiqlash kodi</Text>
              <TextInput
                value={emailCode}
                onChangeText={(t) => setEmailCode(t.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                placeholderTextColor={colors.subtle}
                keyboardType="number-pad"
                autoFocus
                style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, height: 58, fontFamily: font.bold, fontSize: 24, color: colors.ink, textAlign: "center", letterSpacing: 12 }}
              />
              {emailDevCode && (
                <Text className="mt-2 text-center text-[12px] text-subtle">Dev rejimi · kod: {emailDevCode}</Text>
              )}
            </>
          )}

          {step === "phone" && (
            <>
              <Text weight="medium" className="mb-2 text-[13px] text-muted">Telefon raqami</Text>
              <View className="flex-row items-center rounded-2xl bg-surface px-4" style={{ height: 58, borderWidth: 1, borderColor: colors.line }}>
                <Text weight="semibold" className="text-[16px] text-ink">+998</Text>
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
          )}

          {step === "otp" && (
            <>
              <Text weight="medium" className="mb-2 text-[13px] text-muted">Tasdiqlash kodi</Text>
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
                <Text className="mt-2 text-center text-[12px] text-subtle">Dev rejimi · kod: {devCode}</Text>
              )}
              <Text weight="medium" className="mb-2 mt-5 text-[13px] text-muted">Ismingiz (ixtiyoriy)</Text>
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
              <Text className="text-[13px]" style={{ color: colors.danger }}>{error}</Text>
            </View>
          )}
        </View>

        <View className="px-5" style={{ paddingBottom: insets.bottom + 16 }}>
          {step === "email" && (
            <>
              <Button label="Kirish" iconRight="arrow-forward" loading={loading} onPress={submitEmail} />

              <View className="my-4 flex-row items-center" style={{ gap: 10 }}>
                <View className="h-px flex-1" style={{ backgroundColor: colors.line }} />
                <Text className="text-[12px] text-subtle">yoki</Text>
                <View className="h-px flex-1" style={{ backgroundColor: colors.line }} />
              </View>

              <Pressable
                onPress={() => { setError(null); setStep("phone"); }}
                className="flex-row items-center justify-center rounded-2xl bg-surface"
                style={{ height: 54, gap: 10, borderWidth: 1, borderColor: colors.line }}
              >
                <Ionicons name="call-outline" size={19} color={colors.primary} />
                <Text weight="semibold" className="text-[15px] text-ink">Telefon orqali kirish</Text>
              </Pressable>

              {GOOGLE_AVAILABLE && (
                <Pressable
                  onPress={googleLogin}
                  disabled={googleLoading}
                  className="mt-3 flex-row items-center justify-center rounded-2xl bg-surface"
                  style={{ height: 54, gap: 10, borderWidth: 1, borderColor: colors.line, opacity: googleLoading ? 0.6 : 1 }}
                >
                  {googleLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={19} color="#EA4335" />
                      <Text weight="semibold" className="text-[15px] text-ink">Google bilan kirish</Text>
                    </>
                  )}
                </Pressable>
              )}
            </>
          )}

          {step === "email-code" && (
            <Button label="Tasdiqlash" icon="shield-checkmark" loading={loading} onPress={submitEmailCode} />
          )}

          {step === "phone" && (
            <Button label="Davom etish" iconRight="arrow-forward" loading={loading} onPress={sendOtp} />
          )}

          {step === "otp" && (
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
