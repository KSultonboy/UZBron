import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMeDto } from "./dto";

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
  ) {}

  private get devMode(): boolean {
    return this.config.get("OTP_DEV_MODE") === "true";
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
