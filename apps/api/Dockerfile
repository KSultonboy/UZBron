# UZBooking API — production image (mustaqil, monorepo'siz quriladi)
FROM node:22-slim

WORKDIR /app

# Prisma uchun OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Faqat package.json — workspace-only dep (runtime'da ishlatilmaydi) olib tashlanadi
COPY package.json ./
RUN sed -i '/@uzbooking\/shared-types/d' package.json \
    && npm install --no-audit --no-fund

# Prisma client generatsiyasi
COPY prisma ./prisma
RUN npx prisma generate

# Build
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Ishga tushishda migratsiyalarni qo'llab, keyin serverni boshlaymiz
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
