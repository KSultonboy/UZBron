import { useEffect, useState } from "react";
import { Alert, View, ScrollView, TextInput, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, font, shadow } from "@/theme/tokens";
import { useAuthStore } from "@/store/auth";
import { useMe, useUpdateMe } from "@/lib/auth-api";
import type { IconName } from "@/data/hotels";
import type { ProfileGender } from "@uzbooking/shared-types";

function initialsOf(name: string | null | undefined, fallback?: string | null): string {
  const source = name || fallback || "M";
  return source.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function normalizeBirthday(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dotDate = /^(\d{2})\.(\d{2})\.(\d{4})$/u.exec(trimmed);
  if (dotDate) return `${dotDate[3]}-${dotDate[2]}-${dotDate[1]}`;

  return trimmed;
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType,
}: {
  label: string;
  icon: IconName;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
}) {
  return (
    <View className="mb-4">
      <Text weight="medium" className="mb-1.5 text-[12.5px] text-muted">
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-2xl px-4"
        style={{ height: 54, backgroundColor: editable ? colors.surface : "#F0F2F6", borderWidth: 1, borderColor: colors.line, ...shadow.soft }}
      >
        <Ionicons name={icon} size={18} color={editable ? colors.primary : colors.subtle} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.subtle}
          editable={editable}
          keyboardType={keyboardType}
          style={{ flex: 1, marginLeft: 10, fontFamily: font.regular, fontSize: 15, color: editable ? colors.ink : colors.muted }}
        />
        {!editable && <Ionicons name="lock-closed" size={15} color={colors.subtle} />}
      </View>
    </View>
  );
}

const GENDERS: { value: ProfileGender; label: string }[] = [
  { value: "MALE", label: "Erkak" },
  { value: "FEMALE", label: "Ayol" },
  { value: "OTHER", label: "Boshqa" },
];

export default function PersonalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data: me } = useMe(Boolean(user));
  const updateMe = useUpdateMe();
  const profileUser = me ?? user;

  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<ProfileGender | null>(null);

  useEffect(() => {
    if (me) void updateUser(me);
  }, [me, updateUser]);

  useEffect(() => {
    if (!profileUser) {
      setLoadedUserId(null);
      setName("");
      setEmail("");
      setBirthday("");
      setGender(null);
      return;
    }

    if (loadedUserId === profileUser.id) return;
    setLoadedUserId(profileUser.id);
    setName(profileUser.name ?? "");
    setEmail(profileUser.email ?? "");
    setBirthday(profileUser.birthday ?? "");
    setGender(profileUser.gender ?? null);
  }, [loadedUserId, profileUser]);

  const save = async () => {
    if (!profileUser) {
      router.replace("/login");
      return;
    }

    try {
      await updateMe.mutateAsync({
        name: name.trim() || null,
        email: email.trim() || null,
        birthday: normalizeBirthday(birthday),
        gender,
      });
      router.back();
    } catch (error) {
      Alert.alert(
        "Xato",
        error instanceof Error ? error.message : "Ma'lumotlarni saqlab bo'lmadi",
      );
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Shaxsiy ma'lumotlar" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
        <View className="mb-6 items-center">
          <View className="items-center justify-center rounded-full" style={{ width: 92, height: 92, backgroundColor: colors.primary, overflow: "hidden" }}>
            {profileUser?.avatarUrl ? (
              <Image source={{ uri: profileUser.avatarUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={200} />
            ) : (
              <Text weight="bold" className="text-[32px] text-white">
                {initialsOf(profileUser?.name, profileUser?.email ?? profileUser?.phone)}
              </Text>
            )}
          </View>
        </View>

        <Field label="To'liq ism" icon="person-outline" value={name} onChangeText={setName} placeholder="Ismingiz" />
        <Field label="Telefon raqami" icon="call-outline" value={profileUser?.phone ?? ""} editable={false} />
        <Field label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" />
        <Field label="Tug'ilgan sana" icon="calendar-outline" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" />

        <Text weight="medium" className="mb-1.5 text-[12.5px] text-muted">
          Jins
        </Text>
        <View className="flex-row" style={{ gap: 10 }}>
          {GENDERS.map((g) => {
            const active = gender === g.value;
            return (
              <Pressable
                key={g.value}
                onPress={() => setGender(g.value)}
                className="flex-1 items-center justify-center rounded-2xl"
                style={{ height: 50, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.line, ...shadow.soft }}
              >
                <Text weight={active ? "semibold" : "medium"} className="text-[14px]" style={{ color: active ? colors.white : colors.muted }}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="bg-surface px-5" style={{ paddingTop: 12, paddingBottom: insets.bottom + 12, ...shadow.lifted }}>
        <Button label={profileUser ? "Saqlash" : "Kirish"} icon={profileUser ? "checkmark" : "log-in"} loading={updateMe.isPending} onPress={save} />
      </View>
    </View>
  );
}
