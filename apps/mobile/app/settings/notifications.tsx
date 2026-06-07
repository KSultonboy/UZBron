import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SettingsGroup, SettingsRow, Toggle } from "@/components/ui/settings";
import type { IconName } from "@/data/hotels";

interface Pref {
  key: string;
  icon: IconName;
  label: string;
  hint: string;
}

const PUSH: Pref[] = [
  { key: "bookings", icon: "calendar-outline", label: "Bron yangiliklari", hint: "Tasdiq, eslatma, o'zgarishlar" },
  { key: "promos", icon: "pricetag-outline", label: "Aksiya va chegirmalar", hint: "Maxsus takliflar" },
  { key: "reminders", icon: "alarm-outline", label: "Sayohat eslatmalari", hint: "Kirish kunidan oldin" },
];
const COMMS: Pref[] = [
  { key: "email", icon: "mail-outline", label: "Email xabarlar", hint: "Chek va yangiliklar" },
  { key: "sms", icon: "chatbubble-outline", label: "SMS xabarlar", hint: "Muhim bildirishnomalar" },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<Record<string, boolean>>({
    bookings: true,
    promos: true,
    reminders: true,
    email: false,
    sms: true,
  });

  const set = (k: string, v: boolean) => setState((p) => ({ ...p, [k]: v }));

  const renderGroup = (title: string, prefs: Pref[]) => (
    <SettingsGroup title={title}>
      {prefs.map((p, i) => (
        <SettingsRow
          key={p.key}
          icon={p.icon}
          label={p.label}
          hint={p.hint}
          first={i === 0}
          right={<Toggle value={state[p.key]} onChange={(v) => set(p.key, v)} />}
        />
      ))}
    </SettingsGroup>
  );

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Bildirishnomalar" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {renderGroup("Push-bildirishnomalar", PUSH)}
        {renderGroup("Aloqa kanallari", COMMS)}
      </ScrollView>
    </View>
  );
}
