import { useState } from "react";
import { View, ScrollView, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SettingsGroup, SettingsRow, Toggle } from "@/components/ui/settings";
import { useDeleteAccount } from "@/lib/auth-api";

const PRIVACY_URL = "https://uzbooking-api.ruhshonatort.com/privacy";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(true);
  const deleteAccount = useDeleteAccount();

  const openPrivacy = () => {
    void Linking.openURL(PRIVACY_URL);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Hisobni o'chirish",
      "Hisobingiz va unga bog'liq barcha ma'lumotlar (bronlar, sevimlilar, sharhlar) butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.",
      [
        { text: "Bekor qilish", style: "cancel" },
        {
          text: "O'chirish",
          style: "destructive",
          onPress: () => {
            deleteAccount.mutate(undefined, {
              onSuccess: () => {
                Alert.alert("Bajarildi", "Hisobingiz o'chirildi.");
                router.replace("/");
              },
              onError: () => {
                Alert.alert("Xato", "Hisobni o'chirishda xato yuz berdi. Qayta urinib ko'ring.");
              },
            });
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Maxfiylik va xavfsizlik" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SettingsGroup title="Maxfiylik">
          <SettingsRow
            icon="analytics-outline"
            label="Foydalanish tahlili"
            hint="Ilovani yaxshilashga yordam beradi"
            first
            right={<Toggle value={analytics} onChange={setAnalytics} />}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Maxfiylik siyosati"
            onPress={openPrivacy}
          />
        </SettingsGroup>

        <SettingsGroup title="Hisob">
          <SettingsRow
            icon="trash-outline"
            label={deleteAccount.isPending ? "O'chirilmoqda..." : "Hisobni o'chirish"}
            danger
            first
            onPress={deleteAccount.isPending ? undefined : confirmDelete}
          />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
