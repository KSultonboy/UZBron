# UZBron — Codex Handoff (loyihaning to'liq holati va keyingi vazifalar)

> Bu hujjat yangi AI/dasturchi (Codex) chatiga loyihani **noldan tushuntirish** uchun.
> Sana: 2026-06-07. Repo: https://github.com/KSultonboy/UZBron.git (branch: `main`).

---

## 1. Loyiha nima

**UZBron** — O'zbekiston bo'ylab **universal bron platformasi** (super-app).
- **MVP = faqat mehmonxona (hotel) broni.** Lekin data model universal: keyin restoran, salon, sartaroshxona, klinika, sport, dacha **yangi `Category` sifatida** qo'shiladi (sxema o'zgarmaydi).
- **Ikki tomonlama marketplace:** mijoz mobil ilovasi + biznes (vendor) web-portali.
- **To'lov hozircha YO'Q** (keyin Payme/Click qo'shiladi; arxitektura tayyor).
- Til: mahsulot o'zbekcha (UI uz), kod/izohlar uz+en aralash.

---

## 2. Texnologiyalar va monorepo tuzilmasi

Monorepo: **Turborepo + pnpm workspaces** (pnpm@9.15.9, Node >=20).

```
UZBron/
├─ apps/
│  ├─ api/        # NestJS 10 + Prisma 6 + PostgreSQL 16  (backend)
│  ├─ mobile/     # Expo SDK 54 + React Native 0.81 + expo-router  (mijoz ilovasi)
│  └─ portal/     # Next.js 15.5.19 (App Router) + Tailwind  (biznes portali)
├─ packages/
│  └─ shared-types/   # Zod sxemalar / umumiy TS tiplar
├─ deploy/        # prod docker-compose, nginx conf, privacy/delete-account html
├─ docker-compose.yml      # local Postgres (+ ilgari Redis/MinIO)
├─ turbo.json, pnpm-workspace.yaml, tsconfig.base.json
└─ package.json   # root scripts + pnpm.overrides (react/react-dom 19.1.0)
```

**MUHIM root sozlama** — `package.json` da:
```json
"pnpm": { "overrides": { "react": "19.1.0", "react-dom": "19.1.0" } }
```
(Next.js'ning ikki xil React xatosini oldini oladi. O'CHIRMANG.)

Root skriptlar: `pnpm api:dev`, `pnpm mobile:start`, `pnpm db:up` / `db:down`, `pnpm build` (turbo).

---

## 3. Hozir nima ISHLAYDI (deployed)

| Komponent | Holat | Manzil |
|---|---|---|
| **Backend API** | ✅ Prod, HTTPS | `https://uzbooking-api.ruhshonatort.com/api/v1` (Swagger: `/api`) |
| **Biznes portal** | ✅ Vercel, LIVE | `https://uz-bron.vercel.app` |
| **Mobil ilova** | ✅ AAB qurilgan | Play Console closed testing tayyorlanmoqda |
| **GitHub** | ✅ Push qilingan | `KSultonboy/UZBron` (`main`) |

### Backend (VPS)
- Server: **Server 2**, IP `161.97.176.32` (SSH: `ssh -i ~/.ssh/ruxshona_prod_ed25519 root@161.97.176.32`).
- Docker Compose: `deploy/docker-compose.prod.yml` → `db` (postgres:16) + `api` (port `4100:3000`).
- nginx reverse proxy + certbot SSL; DNS Cloudflare'da (`ruhshonatort.com`).
- `deploy/nginx-uzbooking-api.conf` — `/privacy` va `/delete-account` static sahifalar ham shu yerda.
- API konteyner ishga tushganda: `prisma migrate deploy && node dist/main.js`.

### Auth (backend)
- **Telefon OTP:** dev rejimida kod doim `111111` (SMS provayder hali ulanmagan).
- **Google Sign-In:** ID token'ni `https://oauth2.googleapis.com/tokeninfo?id_token=` orqali tekshiradi, `GOOGLE_CLIENT_IDS` (aud) ro'yxatiga qaraydi, email bo'yicha upsert.
- JWT access + refresh; `/auth/refresh`, `/auth/me`, `/auth/me` (PATCH update).

### Data model (Prisma — `apps/api/prisma/schema.prisma`)
Universal: `User` (phone?/email?/googleId?/avatar/birthday/gender), `Category`, `Vendor`, `Listing`, `BookableUnit`, `Availability` (`@@unique([unitId,date,startTime])`), `Booking`, `Review`, `OtpCode`, `Favorite`.
Bron yaratishda transaction + overlap tekshiruvi (`startDate<end && endDate>start`), `totalPrice = nights*price*1.05`.

### Mobil (Expo)
- `apps/mobile/app.json`: name **UZBron**, slug `uzbooking`, scheme `uzbron`, package/bundleId `uz.uzbron.app`, version `0.1.1`, EAS projectId `003aac92-438d-40bc-9c53-86a07157fc8a`, owner `ruhshonatortapps`.
- `eas.json`: `production` (app-bundle, autoIncrement, `EXPO_PUBLIC_API_URL=https://uzbooking-api.ruhshonatort.com/api/v1`), `preview` (apk).
- API base auto-detect: `apps/mobile/src/lib/api.ts` (web→localhost, native dev→`Constants.expoConfig.hostUri`, else `EXPO_PUBLIC_API_URL`); 401→refresh retry.
- Google: `apps/mobile/src/lib/google-auth.ts` — native modulni **lazy `require`** qiladi (Expo Go'da crash bo'lmasin); login tugmasi Expo Go'da yashiriladi. `WEB_CLIENT_ID` hardcoded.
- reanimated 4.x → `babel.config.js` da `react-native-worklets/plugin` SHART.
- **Eslatma:** `npx expo start`ni faqat `apps/mobile` ichidan ishlating (`pnpm mobile:start`).

### Portal (Next.js, Vercel)
- `apps/portal` — App Router. Sahifalar: `app/page.tsx` (Google login), `app/dashboard/`.
- Google login: web Google Identity Services (GSI) skripti `layout.tsx` da.
- **Vercel sozlamasi (muhim):**
  - Root Directory = `apps/portal`
  - Framework = Next.js, "Include files outside root directory" = **ON** (monorepo lockfile uchun)
  - Env: `NEXT_PUBLIC_API_URL=https://uzbooking-api.ruhshonatort.com/api/v1`,
    `NEXT_PUBLIC_GOOGLE_CLIENT_ID=418806562360-p1lni82kjc4ma6e4n70uhimt25e3pd51.apps.googleusercontent.com`
- `next.config.mjs` da `outputFileTracingRoot: path.join(__dirname,"../../")` — pnpm monorepo'da build traces ENOENT xatosini tuzatadi. O'CHIRMANG.

### Google Cloud (OAuth)
- Loyiha brendi: **UZBron**.
- **Web client:** `418806562360-p1lni82kjc4ma6e4n70uhimt25e3pd51.apps.googleusercontent.com` (mobil `webClientId` va portal ham shuni ishlatadi).
- Hozir Authorized JavaScript origins'ga `https://uz-bron.vercel.app` qo'shilishi kerak (yangi domen qo'shilganda yangilanadi).
- **Android OAuth client hali YO'Q** — Play App Signing SHA-1 olib yaratish kerak (quyida Task C).

---

## 4. Sirlar / credentiallar (qayerda)
- Repoda **sir YO'Q** (tozalab push qilingan). Haqiqiy qiymatlar:
  - VPS: `/root/uzbooking/.env` (DB parol, JWT secret, `GOOGLE_CLIENT_IDS`).
  - Vercel: project Environment Variables.
  - Mobil: EAS `production` profil env + `app.json`.
- SSH kalit: `C:\Users\Sultonboy\.ssh\ruxshona_prod_ed25519`.

---

## 5. KEYINGI VAZIFALAR (prioritet bo'yicha)

### ✅ TASK A — Yangi domen `uzbron.uz` ni ulash (BIRINCHI)
Foydalanuvchi **uzbron.uz** domenini sotib oldi. Tavsiya etilgan subdomen sxemasi:

| Subdomen | Nimaga | Qayerga |
|---|---|---|
| `biznes.uzbron.uz` | Biznes portal | **Vercel** (uz-bron project) |
| `api.uzbron.uz` | Backend API | **VPS** `161.97.176.32` (nginx) |
| `uzbron.uz` / `www` | Keyin: landing | (hozircha portalga redirect yoki bo'sh) |

**A1 — Portal (Vercel) uchun `biznes.uzbron.uz`:**
1. Vercel → `uz-bron` project → Settings → **Domains** → Add `biznes.uzbron.uz`.
2. Vercel CNAME target beradi (odatda `cname.vercel-dns.com`).
3. uzbron.uz DNS panelida (registrator yoki Cloudflare) **CNAME** yozuv: `biznes` → `cname.vercel-dns.com` (DNS only / proxy off boshida).
4. Vercel verifikatsiya + avtomatik SSL kutiladi.
5. Yangi domenni **Google Cloud Web client → Authorized JavaScript origins**ga qo'shing: `https://biznes.uzbron.uz`.
6. Vercel env `NEXT_PUBLIC_*` o'zgarmaydi (API hali ruhshonatort'da yoki api.uzbron.uz'ga ko'chsa yangilang).

**A2 — API uchun `api.uzbron.uz` (ixtiyoriy, lekin brending uchun yaxshi):**
1. uzbron.uz DNS: **A** yozuv `api` → `161.97.176.32`.
2. VPS'da nginx server_name'ga `api.uzbron.uz` qo'shing (`deploy/nginx-uzbooking-api.conf` ga qarang) + `certbot --nginx -d api.uzbron.uz`.
3. Hamma joyda API URL'ni yangilang: mobil `eas.json` + `app.json`, portal Vercel env, backend `GOOGLE_CLIENT_IDS`/CORS.
4. Eski `uzbooking-api.ruhshonatort.com` ni vaqtincha qoldiring (orqaga moslik).

> ⚠️ `.uz` ccTLD: DNS registrator panelida (ahost.uz va sh.k.) yoki nameserverlarni Cloudflare'ga yo'naltirib boshqariladi. Avval nameserver/DNS qayerdaligini aniqlang.

---

### TASK B — Portal dashboard: e'lon CRUD + rasm yuklash  (eski Task #34)
Biznes egasi portalga Google bilan kirib, o'z mehmonxonasini kirita olsin.
1. Backend: vendorga tegishli `Listing` + `BookableUnit` + `Availability` uchun **CRUD endpointlar** (JWT guard, faqat egasi). `Vendor` upsert (kirgan user vendor bo'lmasa yaratish/PENDING).
2. **Rasm yuklash:** MinIO EMAS — VPS filesystem + nginx static (`/uploads`), multipart upload endpoint. URL DB'ga saqlanadi.
3. Portal `app/dashboard/`: e'lonlar ro'yxati, qo'shish/tahrirlash formasi (title, tavsif, manzil, lat/lng, kategoriya, rasm), xonalar + narx/bo'sh kunlar, kelgan bronlar ko'rinishi.
4. Portal `lib/api.ts` orqali JWT bilan so'rovlar (token GSI login'dan keyin `/auth/google` natijasidan).

---

### TASK C — Android Google Sign-In yakunlash (SHA-1)  (eski Task #35)
Mobil prod buildda Google login ishlashi uchun:
1. Play Console → App → **App signing** → **App signing key certificate SHA-1** ni oling.
2. Google Cloud → Credentials → **Create OAuth client ID → Android**: package `uz.uzbron.app`, yuqoridagi SHA-1.
3. (debug/EAS uchun ham kerak bo'lsa, EAS credentials SHA-1 ni ham qo'shing.)
4. Backend `GOOGLE_CLIENT_IDS` ga Android client ID'ni qo'shing (aud tekshiruvi uchun).
5. Yangi prod build (EAS) + closed testingda Google login'ni sinash.

---

### TASK D — Play Store nashri
1. Store listing: app icon 512×512, feature graphic 1024×500, screenshotlar (grafikalarni yaratish kerak).
2. Closed testing: **12 tester / 14 kun** talab (production'ga o'tish uchun).
3. Privacy policy URL: `https://uzbooking-api.ruhshonatort.com/privacy` (yoki yangi domen), delete-account: `/delete-account`.

---

## 6. Lokal ishga tushirish
```bash
pnpm install
pnpm db:up                 # local Postgres
cd apps/api && npx prisma generate && npx prisma migrate dev   # birinchi marta
pnpm api:dev               # backend → http://localhost:3000/api (Swagger)
pnpm mobile:start          # Expo (apps/mobile ichidan ishlaydi)
cd apps/portal && pnpm dev # portal → http://localhost:4200
```

---

## 7. MUHIM saboqlar (qaytarmaslik uchun)
1. **Vercel + Next.js versiyasi:** Vercel zaif Next.js versiyalarini bloklaydi ("Vulnerable version of Next.js detected"). Doim eng oxirgi 15.x patch (`npm view next dist-tags` → `backport` tegi) ishlating. Hozir `15.5.19`.
2. **Prisma data-proxy xatosi:** root `pnpm install` Prisma client'ni noto'g'ri (data-proxy) generatsiya qilishi mumkin → `cd apps/api && npx prisma generate`. `apps/api/package.json` da `"postinstall": "prisma generate"` bor.
3. **Expo Go + native modul:** `@react-native-google-signin` Expo Go'da yo'q → lazy `require`, tugmani yashirish. Rasmiy buildda ishlaydi.
4. **pnpm overrides** (react 19.1.0) — Next.js dual-React xatosini oldini oladi.
5. **outputFileTracingRoot** — monorepo'da Vercel build traces ENOENT'ni tuzatadi.
6. Commit/push'dan keyin Vercel **avtomatik** deploy qiladi (~1-1.5 daqiqa). "Redeploy" tugmasi ESKI commit'ni takrorlaydi — yangi deploy uchun push qiling.

---

## 8. Hozirgi aniq keyingi qadam
**TASK A** dan boshlang: `uzbron.uz` DNS qayerda boshqarilishini aniqlang, so'ng `biznes.uzbron.uz` ni Vercel'ga ulang va Google origins'ni yangilang. Keyin TASK B (portal CRUD).
