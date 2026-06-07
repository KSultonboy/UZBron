import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import uz from "./locales/uz.json";
import ru from "./locales/ru.json";
import en from "./locales/en.json";

const SUPPORTED = ["uz", "ru", "en"] as const;
const deviceLang = getLocales()[0]?.languageCode ?? "uz";
const initialLang = (SUPPORTED as readonly string[]).includes(deviceLang)
  ? deviceLang
  : "uz";

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: "uz",
  interpolation: { escapeValue: false },
});

export default i18n;
