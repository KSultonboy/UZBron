import { useState } from "react";
import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, font, shadow } from "@/theme/tokens";
import { AMENITIES, type IconName } from "@/data/hotels";
import { useCreateVendorListing } from "@/lib/vendor";
import { uploadImage } from "@/lib/api";

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, multiline }: {
  label: string; icon: IconName; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: "default" | "numeric"; multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text weight="medium" className="mb-1.5 text-[12.5px] text-muted">{label}</Text>
      <View className="flex-row rounded-2xl bg-surface px-4" style={{ minHeight: 54, alignItems: multiline ? "flex-start" : "center", paddingVertical: multiline ? 14 : 0, borderWidth: 1, borderColor: colors.line, ...shadow.soft }}>
        <Ionicons name={icon} size={18} color={colors.primary} style={{ marginTop: multiline ? 2 : 0 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.subtle}
          keyboardType={keyboardType}
          multiline={multiline}
          style={{ flex: 1, marginLeft: 10, fontFamily: font.regular, fontSize: 15, color: colors.ink, minHeight: multiline ? 70 : undefined, textAlignVertical: multiline ? "top" : "center" }}
        />
      </View>
    </View>
  );
}

export default function NewListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const create = useCreateVendorListing();

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Toshkent");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState(4);
  const [price, setPrice] = useState("");
  const [amenities, setAmenities] = useState<string[]>(["wifi", "parking"]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAmenity = (k: string) =>
    setAmenities((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Rasmlarga ruxsat bering");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (res.canceled) return;
    setUploading(true);
    setError(null);
    try {
      for (const asset of res.assets) {
        const { url } = await uploadImage(asset.uri);
        setPhotos((p) => [...p, url]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rasm yuklashda xato");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) => setPhotos((p) => p.filter((x) => x !== url));

  const submit = async () => {
    if (!title.trim() || !city.trim() || !price) {
      setError("Nomi, shahar va narxni to'ldiring");
      return;
    }
    setError(null);
    try {
      await create.mutateAsync({
        title: title.trim(),
        city: city.trim(),
        district: district.trim() || undefined,
        description: description.trim() || undefined,
        stars,
        basePrice: Number(price),
        amenities,
        photos: photos.length ? photos : [DEFAULT_PHOTO],
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlashda xato");
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Yangi e'lon" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
        <Field label="Mehmonxona nomi" icon="business-outline" value={title} onChangeText={setTitle} placeholder="Masalan: Grand Hotel" />
        <Field label="Shahar" icon="location-outline" value={city} onChangeText={setCity} placeholder="Toshkent" />
        <Field label="Tuman / mo'ljal" icon="navigate-outline" value={district} onChangeText={setDistrict} placeholder="Yunusobod tumani" />

        <Text weight="medium" className="mb-2 text-[12.5px] text-muted">Rasmlar</Text>
        <View className="mb-4 flex-row flex-wrap" style={{ gap: 10 }}>
          {photos.map((url) => (
            <View key={url} style={{ width: 90, height: 90 }}>
              <Image source={{ uri: url }} style={{ width: 90, height: 90, borderRadius: 14 }} contentFit="cover" />
              <Pressable onPress={() => removePhoto(url)} hitSlop={6} style={{ position: "absolute", top: -7, right: -7, backgroundColor: colors.white, borderRadius: 11 }}>
                <Ionicons name="close-circle" size={22} color={colors.danger} />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={pickImages}
            disabled={uploading}
            style={{ width: 90, height: 90, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.line, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text className="mt-1 text-[10.5px] text-muted">Yuklash</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text weight="medium" className="mb-1.5 text-[12.5px] text-muted">Yulduzlar</Text>
        <View className="mb-4 flex-row" style={{ gap: 8 }}>
          {[3, 4, 5].map((s) => {
            const active = stars === s;
            return (
              <Pressable key={s} onPress={() => setStars(s)} className="flex-1 flex-row items-center justify-center rounded-2xl" style={{ height: 50, gap: 4, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.line, ...shadow.soft }}>
                <Ionicons name="star" size={15} color={active ? colors.goldLight : colors.gold} />
                <Text weight="semibold" className="text-[14px]" style={{ color: active ? colors.white : colors.ink }}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Bir kecha narxi (so'm)" icon="cash-outline" value={price} onChangeText={(t) => setPrice(t.replace(/\D/g, ""))} placeholder="500000" keyboardType="numeric" />
        <Field label="Tavsif" icon="document-text-outline" value={description} onChangeText={setDescription} placeholder="Mehmonxona haqida qisqacha..." multiline />

        <Text weight="medium" className="mb-2 text-[12.5px] text-muted">Qulayliklar</Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {AMENITIES.map((a) => {
            const active = amenities.includes(a.key);
            return (
              <Pressable key={a.key} onPress={() => toggleAmenity(a.key)} className="flex-row items-center rounded-full px-3.5" style={{ height: 38, gap: 6, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.line }}>
                <Ionicons name={a.icon} size={15} color={active ? colors.white : colors.muted} />
                <Text weight="medium" className="text-[13px]" style={{ color: active ? colors.white : colors.muted }}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {error && (
          <View className="mt-4 flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text className="text-[13px]" style={{ color: colors.danger }}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View className="bg-surface px-5" style={{ paddingTop: 12, paddingBottom: insets.bottom + 12, ...shadow.lifted }}>
        <Button label="E'lonni nashr qilish" icon="checkmark-circle" loading={create.isPending} onPress={submit} />
      </View>
    </View>
  );
}
