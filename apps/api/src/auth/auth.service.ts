import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "./mail.service";
import { UpdateMeDto } from "./dto";

const scryptAsync = promisify(scrypt);

export interface JwtPayload {
  sub: string;
  role: string;
  phone: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  private get devMode(): boolean {
    return this.config.get("OTP_DEV_MODE") === "true";
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  private async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashBuf = Buffer.from(hash, "hex");
    return hashBuf.length === derived.length && timingSafeEqual(hashBuf, derived);
  }

  /** 1-qadam: telefonga OTP yuborish (dev rejimida kod javobda qaytadi) */
  async requestOtp(phone: string): Promise<{ sent: true; devCode?: string }> {
    const code = this.devMode
      ? "111111"
      : String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.deleteMany({ where: { phone } });
    await this.prisma.otpCode.create({ data: { phone, code, expiresAt } });

    // Prod: bu yerda Eskiz.uz / Play Mobile SMS yuboriladi
    // eslint-disable-next-line no-console
    console.log(`[OTP] ${phone} -> ${code}`);

    return { sent: true, ...(this.devMode ? { devCode: code } : {}) };
  }

  /** 2-qadam: OTP tasdiqlash (ro'yxat/kirish) */
  async verifyOtp(phone: string, code: string, name?: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, code, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) throw new UnauthorizedException("Kod noto'g'ri yoki muddati o'tgan");

    await this.prisma.otpCode.deleteMany({ where: { phone } });

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: name ? { name } : {},
      create: { phone, name: name ?? null },
    });

    const tokens = await this.issueTokens(user.id, user.role, user.phone);
    return { user: this.publicUser(user), tokens };
  }

  /** Google ID token orqali kirish/ro'yxatdan o'tish */
  async googleSignIn(idToken: string) {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!res.ok) throw new UnauthorizedException("Google token yaroqsiz");
    const info = (await res.json()) as {
      aud: string;
      sub: string;
      email?: string;
      email_verified?: string;
      name?: string;
      picture?: string;
    };

    // aud (client ID) ni tekshirish — env'da ro'yxat bo'lsa
    const allowed = (this.config.get<string>("GOOGLE_CLIENT_IDS") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowed.length > 0 && !allowed.includes(info.aud)) {
      throw new UnauthorizedException("Google client ID mos kelmadi");
    }
    if (!info.email) throw new UnauthorizedException("Google email topilmadi");

    const user = await this.prisma.user.upsert({
      where: { email: info.email },
      update: {
        googleId: info.sub,
        avatarUrl: info.picture ?? null,
        name: info.name ?? undefined,
      },
      create: {
        email: info.email,
        googleId: info.sub,
        avatarUrl: info.picture ?? null,
        name: info.name ?? null,
      },
    });

    const tokens = await this.issueTokens(user.id, user.role, user.phone ?? "");
    return { user: this.publicUser(user), tokens };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Refresh token yaroqsiz");
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("Foydalanuvchi topilmadi");
    const tokens = await this.issueTokens(user.id, user.role, user.phone);
    return { user: this.publicUser(user), tokens };
  }

  async me(userId: string) {
    const [user, reviewStats] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendor: { select: { id: true } },
          _count: { select: { bookings: true, favorites: true, reviews: true } },
        },
      }),
      this.prisma.review.aggregate({
        where: { customerId: userId },
        _avg: { rating: true },
      }),
    ]);
    if (!user) throw new UnauthorizedException();
    return {
      ...this.publicUser(user),
      vendorId: user.vendor?.id ?? null,
      stats: {
        bookingsCount: user._count.bookings,
        favoritesCount: user._count.favorites,
        reviewsCount: user._count.reviews,
        averageRating: reviewStats._avg.rating,
      },
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data: {
      name?: string | null;
      email?: string | null;
      birthday?: Date | null;
      gender?: string | null;
    } = {};

    if (dto.name !== undefined) data.name = dto.name ? dto.name.trim() : null;
    if (dto.email !== undefined) data.email = dto.email ? dto.email.trim().toLowerCase() : null;
    if (dto.birthday !== undefined) data.birthday = dto.birthday ? new Date(dto.birthday) : null;
    if (dto.gender !== undefined) data.gender = dto.gender;

    await this.prisma.user.update({ where: { id: userId }, data });
    return this.me(userId);
  }

  /** Hisobni va unga bog'liq barcha ma'lumotlarni o'chirish (Play talabi). */
  async deleteAccount(userId: string) {
    // bookings va reviews User'ga cascade emas — avval qo'lda o'chiramiz.
    // favorites va vendor (→listings→units...) cascade orqali o'chadi.
    await this.prisma.$transaction([
      this.prisma.review.deleteMany({ where: { customerId: userId } }),
      this.prisma.booking.deleteMany({ where: { customerId: userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
    return { ok: true };
  }

  /**
   * Email + parol bilan kirish (oddiy ko'rinishdagi auth).
   * - Oddiy foydalanuvchi → to'g'ridan-to'g'ri tokenlar.
   * - Biznes/agentlik a'zosi (Vendor bor yoki VENDOR/ADMIN) → emailga kod yuboriladi (2FA).
   */
  async loginWithPassword(email: string, password: string) {
    const e = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: e },
      include: { vendor: { select: { id: true } } },
    });
    // Bir xil xato — userni "bor/yo'q" ekanini oshkor qilmaymiz.
    if (!user || !user.passwordHash || !(await this.verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    const isBusiness = !!user.vendor || user.role === "VENDOR" || user.role === "ADMIN";
    if (isBusiness) {
      const code = this.devMode
        ? "111111"
        : String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await this.prisma.emailCode.deleteMany({ where: { email: e } });
      await this.prisma.emailCode.create({ data: { email: e, code, expiresAt } });
      await this.mail.sendCode(e, code);
      return { requiresEmailCode: true, email: e, ...(this.devMode ? { devCode: code } : {}) };
    }

    const tokens = await this.issueTokens(user.id, user.role, user.phone);
    return { user: this.publicUser(user), tokens };
  }

  /** Biznes 2FA: emailga yuborilgan kodni tasdiqlash → tokenlar. */
  async verifyEmailCode(email: string, code: string) {
    const e = email.trim().toLowerCase();
    const rec = await this.prisma.emailCode.findFirst({
      where: { email: e, code, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!rec) throw new UnauthorizedException("Kod noto'g'ri yoki muddati o'tgan");
    await this.prisma.emailCode.deleteMany({ where: { email: e } });

    const user = await this.prisma.user.findUnique({ where: { email: e } });
    if (!user) throw new UnauthorizedException("Foydalanuvchi topilmadi");
    const tokens = await this.issueTokens(user.id, user.role, user.phone);
    return { user: this.publicUser(user), tokens };
  }

  /** Biznes/agentlik (yoki admin) akkauntini email+parol bilan yaratish. */
  async createBusinessAccount(dto: {
    email: string;
    password: string;
    name?: string;
    businessName?: string;
    role?: "VENDOR" | "ADMIN";
  }) {
    const e = dto.email.trim().toLowerCase();
    if (dto.password.length < 6) throw new BadRequestException("Parol kamida 6 belgidan iborat bo'lsin");
    const passwordHash = await this.hashPassword(dto.password);
    const role = dto.role === "ADMIN" ? "ADMIN" : "VENDOR";

    const user = await this.prisma.user.upsert({
      where: { email: e },
      update: { passwordHash, role, ...(dto.name ? { name: dto.name } : {}) },
      create: { email: e, passwordHash, role, name: dto.name ?? null },
    });
    // Admin uchun vendor yozuvi kerak emas
    if (role === "VENDOR") {
      await this.prisma.vendor.upsert({
        where: { ownerId: user.id },
        update: { name: dto.businessName ?? dto.name ?? "Biznes", status: "APPROVED" },
        create: {
          ownerId: user.id,
          name: dto.businessName ?? dto.name ?? "Biznes",
          status: "APPROVED",
        },
      });
    }
    return { ok: true, userId: user.id, email: e, role };
  }

  /** x-admin-secret bilan biznes/admin akkaunt yaratish (bootstrap uchun). */
  async createBusiness(
    secret: string | undefined,
    dto: { email: string; password: string; name?: string; businessName?: string; role?: "VENDOR" | "ADMIN" },
  ) {
    const adminSecret = this.config.get<string>("ADMIN_SECRET");
    if (!adminSecret || secret !== adminSecret) {
      throw new UnauthorizedException("Ruxsat yo'q");
    }
    return this.createBusinessAccount(dto);
  }

  private async issueTokens(sub: string, role: string, phone: string | null) {
    const accessToken = await this.jwt.signAsync(
      { sub, role, phone },
      {
        secret: this.config.get("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get("JWT_ACCESS_TTL") ?? "15m",
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub, role, phone },
      {
        secret: this.config.get("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get("JWT_REFRESH_TTL") ?? "30d",
      },
    );
    return { accessToken, refreshToken };
  }

  private publicUser(u: {
    id: string;
    phone: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    birthday?: Date | string | null;
    gender?: string | null;
    name: string | null;
    role: string;
  }) {
    const birthday =
      u.birthday instanceof Date
        ? u.birthday.toISOString().slice(0, 10)
        : u.birthday ?? null;

    return {
      id: u.id,
      phone: u.phone,
      email: u.email ?? null,
      avatarUrl: u.avatarUrl ?? null,
      birthday,
      gender: u.gender ?? null,
      name: u.name,
      role: u.role,
    };
  }
}
