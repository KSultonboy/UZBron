import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SettingsGroup, SettingsRow, Toggle } from "@/components/ui/settings";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const [biometric, setBiometric] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Maxfiylik va xavfsizlik" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SettingsGroup title="Xavfsizlik">
          <SettingsRow
            icon="finger-print-outline"
            label="Biometrik kirish"
            hint="Face ID / barmoq izi"
            first
            right={<Toggle value={biometric} onChange={setBiometric} />}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Ikki bosqichli himoya"
            hint="SMS orqali tasdiqlash"
            right={<Toggle value={twoFa} onChange={setTwoFa} />}
          />
          <SettingsRow icon="key-outline" label="Parolni o'zgartirish" onPress={() => {}} />
        </SettingsGroup>

        <SettingsGroup title="Maxfiylik">
          <SettingsRow
            icon="analytics-outline"
            label="Foydalanish tahlili"
            hint="Ilovani yaxshilashga yordam"
            first
            right={<Toggle value={analytics} onChange={setAnalytics} />}
          />
          <SettingsRow icon="phone-portrait-outline" label="Faol seanslar" hint="2 ta qurilma" onPress={() => {}} />
          <SettingsRow icon="document-text-outline" label="Maxfiylik siyosati" onPress={() => {}} />
        </SettingsGroup>

        <SettingsGroup title="Hisob">
          <SettingsRow icon="trash-outline" label="Hisobni o'chirish" danger first onPress={() => {}} />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
