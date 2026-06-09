// Minimal API client — fetch wrapper. Token avtomatik qo'shiladi.
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "@/store/auth";

const API_PORT = 3000;
const API_PATH = "/api/v1";

/**
 * API manzilini avtomatik aniqlash:
 * - Web: localhost (bir xil mashina)
 * - Telefon/emulyator (dev): Expo Metro host IP'si (har doim joriy mashina IP)
 * - Aniq qiymat: EXPO_PUBLIC_API_URL (prod/override)
 */
function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === "web") return `http://localhost:${API_PORT}${API_PATH}`;

  // Expo dev serverining host manzili (masalan "10.245.254.155:8081")
  const expoGo = (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig;
  const hostUri = Constants.expoConfig?.hostUri ?? expoGo?.debuggerHost ?? "";
  const host = hostUri.split(":")[0];
  if (host) return `http://${host}:${API_PORT}${API_PATH}`;

  return `http://localhost:${API_PORT}${API_PATH}`;
}

export const BASE_URL = resolveBaseUrl();

/** API origin (prefiks/versiyasiz) — masalan health endpointi uchun */
export const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+\/?$/u, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

/** Access token muddati tugaganda refresh token bilan yangilash */
async function tryRefresh(): Promise<boolean> {
  const rt = useAuthStore.getState().tokens?.refreshToken;
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    await useAuthStore.getState().signIn(data.user, data.tokens);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
  _retried = false,
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;
  const token = auth ? useAuthStore.getState().tokens?.accessToken : undefined;
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 -> bir marta refresh qilib qayta urinish
  if (res.status === 401 && auth && !_retried) {
    const ok = await tryRefresh();
    if (ok) return apiFetch<T>(path, options, true);
    await useAuthStore.getState().signOut();
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message =
      (data && (data.message as string)) || `So'rov xatosi (${res.status})`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};

/** Rasm yuklash — lokal URI'dan serverga (multipart). URL qaytaradi. */
export async function uploadImage(uri: string): Promise<{ url: string }> {
  const token = useAuthStore.getState().tokens?.accessToken;
  const name = uri.split("/").pop() || "photo.jpg";
  const extMatch = /\.(\w+)$/.exec(name.toLowerCase());
  const ext = extMatch ? extMatch[1] : "jpg";
  const type = `image/${ext === "jpg" ? "jpeg" : ext}`;

  const form = new FormData();
  // React Native FormData fayl obyekti
  form.append("file", { uri, name, type } as unknown as Blob);

  const res = await fetch(`${BASE_URL}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new ApiError(res.status, t || "Rasm yuklashda xato");
  }
  return (await res.json()) as { url: string };
}
