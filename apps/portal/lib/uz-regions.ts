// O'zbekiston viloyatlari va asosiy shaharlari — dropdownlar uchun yagona manba.

export interface UzRegion {
  name: string;
  cities: string[];
}

export const UZ_REGIONS: UzRegion[] = [
  { name: "Toshkent shahri", cities: ["Toshkent"] },
  {
    name: "Toshkent viloyati",
    cities: ["Nurafshon", "Angren", "Bekobod", "Chirchiq", "Ohangaron", "Olmaliq", "Yangiyo'l", "G'azalkent", "Parkent"],
  },
  { name: "Samarqand", cities: ["Samarqand", "Kattaqo'rg'on", "Urgut", "Bulung'ur", "Ishtixon"] },
  { name: "Buxoro", cities: ["Buxoro", "Kogon", "G'ijduvon", "Vobkent", "Romitan"] },
  { name: "Xorazm", cities: ["Urganch", "Xiva", "Hazorasp", "Shovot", "Gurlan"] },
  { name: "Andijon", cities: ["Andijon", "Asaka", "Xonobod", "Shahrixon", "Marhamat"] },
  { name: "Farg'ona", cities: ["Farg'ona", "Marg'ilon", "Qo'qon", "Quvasoy", "Rishton", "Quva"] },
  { name: "Namangan", cities: ["Namangan", "Chust", "Pop", "Kosonsoy", "Uchqo'rg'on"] },
  { name: "Qashqadaryo", cities: ["Qarshi", "Shahrisabz", "Kitob", "G'uzor", "Koson"] },
  { name: "Surxondaryo", cities: ["Termiz", "Denov", "Boysun", "Sherobod", "Sho'rchi"] },
  { name: "Navoiy", cities: ["Navoiy", "Zarafshon", "Nurota", "Konimex", "Karmana"] },
  { name: "Jizzax", cities: ["Jizzax", "G'allaorol", "Zarbdor", "Do'stlik"] },
  { name: "Sirdaryo", cities: ["Guliston", "Shirin", "Yangiyer", "Boyovut", "Sirdaryo"] },
  { name: "Qoraqalpog'iston", cities: ["Nukus", "Mo'ynoq", "Xo'jayli", "Beruniy", "Taxiatosh"] },
];

/** Barcha shaharlar — yagona ro'yxat (alifbo bo'yicha). */
export const UZ_CITIES: string[] = Array.from(
  new Set(UZ_REGIONS.flatMap((r) => r.cities)),
).sort((a, b) => a.localeCompare(b, "uz"));

/** Shahar nomidan viloyatni topish. */
export function regionOfCity(city?: string | null): UzRegion | undefined {
  if (!city) return undefined;
  return UZ_REGIONS.find((r) => r.cities.includes(city));
}

/** Viloyat nomidan shaharlar ro'yxati. */
export function citiesOfRegion(regionName?: string | null): string[] {
  return UZ_REGIONS.find((r) => r.name === regionName)?.cities ?? [];
}
