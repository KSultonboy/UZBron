# UZBooking

O'zbekiston bo'ylab universal bron platformasi — mehmonxona, dacha, restoran, sport maydoni, go'zallik saloni, sartaroshxona, shifokor/klinika va boshqa xizmatlarni bitta ilovada bron qilish (super-app / ko'p-vertikalli marketplace).

**MVP:** Mehmonxona (hotel) broni. Data model boshidanoq universal — yangi vertikallar `Category` sifatida qo'shiladi.

## Texnologiyalar

| Qatlam | Stek |
|--------|------|
| Mobil | Expo (React Native) + TypeScript, Expo Router, TanStack Query, Zustand, NativeWind, i18next |
| Backend | NestJS + Prisma + PostgreSQL |
| Umumiy | Zod sxemalar (`packages/shared-types`) |
| Infra | Turborepo + pnpm monorepo, Docker Compose (Postgres + Redis + MinIO) |

## Tuzilma

```
apps/
  api/            NestJS backend
  mobile/         Expo ilova (mijoz + biznes paneli)
packages/
  shared-types/   Umumiy TS tiplar + Zod sxemalar
docker-compose.yml
```

## Ishga tushirish

```bash
# 1. Bog'liqliklarni o'rnatish
pnpm install

# 2. Local servislar (Postgres + Redis + MinIO)
pnpm db:up

# 3. Backend (migratsiya + seed avtomatik)
pnpm --filter @uzbooking/api prisma:migrate
pnpm --filter @uzbooking/api prisma:seed
pnpm api:dev          # Swagger: http://localhost:3000/api

# 4. Mobil
pnpm mobile:start     # Expo Go yoki simulyator
```

## Rivojlanish bosqichlari

- **0** — Poydevor (monorepo, docker, skeletlar) ← joriy
- **1** — Auth (telefon + OTP, JWT)
- **2** — Listing & qidiruv (mijoz)
- **3** — Bron oqimi
- **4** — Biznes paneli
- **5** — Sharhlar + jilolash

Batafsil reja: `C:\Users\Sultonboy\.claude\plans\men-uzbekistan-boylab-har-piped-hickey.md`
