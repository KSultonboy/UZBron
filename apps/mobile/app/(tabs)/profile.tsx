import { useEffect } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { colors, gradients, shadow } from "@/theme/tokens";
import { useFavoritesStore } from "@/store/favorites";
import { useAuthStore } from "@/store/auth";
import { useMe } from "@/lib/auth-api";

function initialsOf(name: string | null | undefined, fallback?: string | null): string {
  const source = name || fallback || "M";
  return source.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const LANGS = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

interface MenuRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  route: Href;
}

const MENU: { section: string; rows: MenuRow[] }[] = [
  {
    section: "Hisob",
    rows: [
      { icon: "person-outline", label: "Shaxsiy ma'lumotlar", route: "/account/personal" },
      { icon: "heart-outline", label: "Saqlanganlar", route: "/saved" },
      { icon: "card-outline", label: "To'lov usullari", route: "/account/payments" },
    ],
  },
  {
    section: "Sozlamalar",
    rows: [
      { icon: "notifications-outline", label: "Bildirishnomalar", route: "/settings/notifications" },
      { icon: "shield-checkmark-outline", label: "Maxfiylik va xavfsizlik", route: "/settings/privacy" },
      { icon: "help-circle-outline", label: "Yordam markazi", route: "/settings/help" },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { i18n } = useTranslation();
  const favCount = useFavoritesStore((s) => s.ids.length);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const signOut = useAuthStore((s) => s.signOut);
  const isAuthed = Boolean(user);
  const { data: me } = useMe(isAuthed);
  const profileUser = me ?? user;
  const stats = me?.stats;
  const savedCount = stats?.favoritesCount ?? favCount;
  const profileSubtitle = isAuthed
    ? profileUser?.phone ?? profileUser?.email ?? "Profil ma'lumotlari"
    : "Kirish uchun bosing ->";
  const ratingValue = stats?.averageRating != null ? stats.averageRating.toFixed(1) : "0.0";

  useEffect(() => {
    if (me) void updateUser(me);
  }, [me, updateUser]);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header */}
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 38, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <View className="flex-row items-center">
            <Avatar
              avatarUrl={profileUser?.avatarUrl}
              initials={initialsOf(profileUser?.name, profileUser?.email ?? profileUser?.phone)}
            />
            <Pressable
              className="flex-1 pl-4"
              onPress={() => !isAuthed && router.push("/login")}
            >
              <Text weight="bold" className="text-[19px] text-white">
                {profileUser?.name ?? "Mehmon"}
              </Text>
              <Text className="text-[13px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                {profileSubtitle}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(isAuthed ? "/account/personal" : "/login")}
              className="items-center justify-center rounded-full"
              style={{ width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.16)" }}
            >
              <Ionicons name={isAuthed ? "create-outline" : "log-in-outline"} size={20} color={colors.white} />
            </Pressable>
          </View>

          {/* Stats */}
          <View className="mt-5 flex-row rounded-2xl px-2 py-3" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <Stat value={String(stats?.bookingsCount ?? 0)} label="Bronlar" />
            <Divider />
            <Stat value={String(savedCount)} label="Saqlangan" />
            <Divider />
            <Stat value={ratingValue} label="Reyting" />
          </View>
        </LinearGradient>

        {/* Til */}
        <View className="mt-5 px-5">
          <Text weight="bold" className="mb-2.5 text-[13px] text-muted">
            TIL / ЯЗЫК / LANGUAGE
          </Text>
          <View className="flex-row" style={{ gap: 10 }}>
            {LANGS.map((l) => {
              const active = i18n.language === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => i18n.changeLanguage(l.code)}
                  className="flex-1 items-center rounded-2xl py-3"
                  style={[
                    { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: active ? colors.primary : "transparent" },
                    shadow.soft,
                  ]}
                >
                  <Text className="text-[22px]">{l.flag}</Text>
                  <Text weight={active ? "semibold" : "medium"} className="mt-1 text-[12.5px]" style={{ color: active ? colors.primary : colors.muted }}>
                    {l.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Biznes paneli */}
        {isAuthed && (
          <View className="mt-6 px-5">
            <Pressable onPress={() => router.push("/vendor")} style={shadow.soft}>
              <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center" }}
              >
                <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
                  <Ionicons name="business" size={24} color={colors.white} />
                </View>
                <View className="flex-1 pl-3">
                  <Text weight="bold" className="text-[16px] text-white">Biznes paneli</Text>
                  <Text className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Mehmonxona qo'shing va bronlarni boshqaring
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Menyu */}
        {MENU.map((group) => (
          <View key={group.section} className="mt-6 px-5">
            <Text weight="bold" className="mb-2.5 text-[13px] text-muted">
              {group.section.toUpperCase()}
            </Text>
            <View className="rounded-2xl bg-surface" style={shadow.soft}>
              {group.rows.map((row, i) => {
                const hint = row.label === "Saqlanganlar" && savedCount > 0 ? String(savedCount) : undefined;
                return (
                  <Pressable
                    key={row.label}
                    onPress={() => router.push(row.route)}
                    className="flex-row items-center px-4 py-3.5"
                    style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}
                  >
                    <View className="items-center justify-center rounded-xl" style={{ width: 38, height: 38, backgroundColor: "#EEF3FC" }}>
                      <Ionicons name={row.icon} size={18} color={colors.primary} />
                    </View>
                    <Text weight="medium" className="flex-1 pl-3 text-[14.5px] text-ink">
                      {row.label}
                    </Text>
                    {hint && (
                      <View className="mr-2 rounded-full px-2 py-0.5" style={{ backgroundColor: colors.goldSoft }}>
                        <Text weight="semibold" className="text-[11px]" style={{ color: colors.gold }}>
                          {hint}
                        </Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Chiqish / Kirish */}
        <View className="mt-6 px-5">
          <Pressable
            onPress={() => (isAuthed ? signOut() : router.push("/login"))}
            className="flex-row items-center justify-center rounded-2xl bg-surface py-4"
            style={[{ gap: 8 }, shadow.soft]}
          >
            <Ionicons
              name={isAuthed ? "log-out-outline" : "log-in-outline"}
              size={19}
              color={isAuthed ? colors.danger : colors.primary}
            />
            <Text weight="semibold" className="text-[15px]" style={{ color: isAuthed ? colors.danger : colors.primary }}>
              {isAuthed ? "Chiqish" : "Kirish / Ro'yxatdan o'tish"}
            </Text>
          </Pressable>
          <Text className="mt-4 text-center text-[12px] text-subtle">UZBron · versiya 0.1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Avatar({ avatarUrl, initials }: { avatarUrl?: string | null; initials: string }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: 68,
        height: 68,
        backgroundColor: "rgba(255,255,255,0.16)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
        overflow: "hidden",
      }}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={200} />
      ) : (
        <Text weight="bold" className="text-[24px] text-white">
          {initials}
        </Text>
      )}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text weight="bold" className="text-[18px] text-white">
        {value}
      </Text>
      <Text className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.75)" }}>
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.18)", marginVertical: 2 }} />;
}
