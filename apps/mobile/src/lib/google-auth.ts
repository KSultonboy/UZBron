// Google bilan kirish — native (@react-native-google-signin) + backend /auth/google.
// MUHIM: native modul Expo Go'da YO'Q. Shuning uchun uni faqat tugma bosilganda
// (lazy require) yuklaymiz — aks holda Expo Go ilovani ochishda crash bo'ladi.
import { api } from "./api";
import type { AuthResult } from "./auth-api";

// Public Web client ID (sir emas)
const WEB_CLIENT_ID =
  "418806562360-p1lni82kjc4ma6e4n70uhimt25e3pd51.apps.googleusercontent.com";

let configured = false;

/** Google kirish bu muhitda (Expo Go emas, balki rasmiy build) mavjudmi */
export function isGoogleAvailable(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@react-native-google-signin/google-signin");
    return true;
  } catch {
    return false;
  }
}

/**
 * Google oynasini ochadi, ID token oladi va backendga yuboradi.
 * Bekor qilinsa null. Native modul bo'lmasa (Expo Go) — tushunarli xato.
 */
export async function signInWithGoogle(): Promise<AuthResult | null> {
  let mod: typeof import("@react-native-google-signin/google-signin");
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("@react-native-google-signin/google-signin");
  } catch {
    throw new Error("Google kirish bu muhitda mavjud emas (rasmiy ilovada ishlaydi).");
  }

  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = mod;

  if (!configured) {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
    configured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null; // foydalanuvchi bekor qildi
    const idToken = response.data.idToken;
    if (!idToken) throw new Error("Google ID token olinmadi");
    return await api.post<AuthResult>("/auth/google", { idToken }, { auth: false });
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return null;
    throw e;
  }
}
