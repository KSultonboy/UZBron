# UZBooking — Production Deploy (Server 2)

## Server
- **IP:** 161.97.176.32 (Ubuntu 24.04, 4 CPU, 8 GB RAM)
- **SSH:** `ssh -i ~/.ssh/ruxshona_prod_ed25519 root@161.97.176.32`
- **Joylashuv:** `/opt/uzbooking/`
  - `apps/api/` — API manba kodi
  - `deploy/docker-compose.prod.yml` + `deploy/.env` (sirlar)

## Hozirgi holat
- 🟢 **API:** `http://161.97.176.32:4100` (Docker, `prisma migrate deploy` + seed bajarilgan)
- 🟢 **Postgres:** Docker konteyner (`uzbooking-db`, volume: `deploy_uzbooking_pgdata`)
- Auth: OTP **dev rejimi** (kod `111111`) — prodda Eskiz.uz yoki Google-only qilinadi
- Google Sign-In backend: `POST /api/v1/auth/google` (GOOGLE_CLIENT_IDS env'da)

## Kodni yangilab qayta deploy qilish (lokal mashinadan)
```bash
# 1. Yangi kodni yuborish
tar czf - -C apps/api --exclude=node_modules --exclude=dist --exclude=.env . \
  | ssh -i ~/.ssh/ruxshona_prod_ed25519 root@161.97.176.32 \
    "rm -rf /opt/uzbooking/apps/api/* && tar xzf - -C /opt/uzbooking/apps/api"

# 2. Qayta build + ishga tushirish
ssh -i ~/.ssh/ruxshona_prod_ed25519 root@161.97.176.32 \
  "cd /opt/uzbooking/deploy && docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
```

## Foydali buyruqlar (serverda)
```bash
cd /opt/uzbooking/deploy
docker compose -f docker-compose.prod.yml logs -f api   # loglar
docker compose -f docker-compose.prod.yml restart api    # restart
docker exec uzbooking-api npx prisma db seed             # qayta seed
docker exec -it uzbooking-db psql -U uzbooking           # DB konsoli
```

## Qoldi (production-grade uchun)
1. **HTTPS** — subdomen (DNS A → 161.97.176.32) + nginx + certbot SSL
   (`deploy/nginx-uzbooking-api.conf` shabloni tayyor)
2. **GOOGLE_CLIENT_IDS** — Google Cloud OAuth client ID'larini `.env`ga qo'shish
3. **OTP_DEV_MODE=false** + real SMS (Eskiz.uz) — yoki faqat Google kirish
4. Backup (pg_dump cron), monitoring
