import {
  Body,
  CanActivate,
  Controller,
  Delete,
  ExecutionContext,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsIn } from "class-validator";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateBusinessDto } from "../auth/dto";

class UpdateVendorStatusDto {
  @IsIn(["APPROVED", "PENDING", "BLOCKED"]) status!: "APPROVED" | "PENDING" | "BLOCKED";
}

class UpdateFeedbackStatusDto {
  @IsIn(["NEW", "RESOLVED"]) status!: "NEW" | "RESOLVED";
}

/** Faqat ADMIN rolidagi foydalanuvchilarga ruxsat. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: { role?: string } }>();
    if (req.user?.role !== "ADMIN") throw new ForbiddenException("Admin huquqi kerak");
    return true;
  }
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async stats() {
    const [users, vendors, listings, bookings, pendingVendors] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.prisma.listing.count(),
      this.prisma.booking.count(),
      this.prisma.vendor.count({ where: { status: "PENDING" } }),
    ]);
    return { users, vendors, listings, bookings, pendingVendors };
  }

  async vendors() {
    const vendors = await this.prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { email: true, phone: true, name: true } },
        _count: { select: { listings: true } },
      },
    });
    return {
      items: vendors.map((v) => ({
        id: v.id,
        name: v.name,
        status: v.status,
        email: v.owner.email,
        phone: v.owner.phone ?? v.phone,
        ownerName: v.owner.name,
        listingsCount: v._count.listings,
        createdAt: v.createdAt.toISOString().slice(0, 10),
      })),
    };
  }

  async setVendorStatus(id: string, status: "APPROVED" | "PENDING" | "BLOCKED") {
    const v = await this.prisma.vendor.findUnique({ where: { id } });
    if (!v) throw new NotFoundException("Vendor topilmadi");
    await this.prisma.vendor.update({ where: { id }, data: { status } as Prisma.VendorUpdateInput });
    return { ok: true, status };
  }

  async listings() {
    const listings = await this.prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: { vendor: { select: { name: true } }, _count: { select: { bookings: true } } },
    });
    return {
      items: listings.map((l) => ({
        id: l.id,
        title: l.title,
        city: l.city,
        status: l.status,
        photo: l.photos[0] ?? null,
        vendorName: l.vendor.name,
        bookingsCount: l._count.bookings,
        createdAt: l.createdAt.toISOString().slice(0, 10),
      })),
    };
  }

  async deleteListing(id: string) {
    const l = await this.prisma.listing.findUnique({ where: { id } });
    if (!l) throw new NotFoundException("E'lon topilmadi");
    await this.prisma.$transaction([
      this.prisma.review.deleteMany({ where: { listingId: id } }),
      this.prisma.booking.deleteMany({ where: { listingId: id } }),
      this.prisma.listing.delete({ where: { id } }),
    ]);
    return { ok: true };
  }

  createBusiness(dto: CreateBusinessDto) {
    return this.auth.createBusinessAccount(dto);
  }

  /** To'liq hisobot — daromad, komissiya, status bo'yicha bronlar, top mehmonxonalar. */
  async reports() {
    const PAID = ["CONFIRMED", "COMPLETED"] as const;
    const [revenueAgg, statusGroups, topListings, recentCount] = await Promise.all([
      this.prisma.booking.aggregate({
        _sum: { totalPrice: true },
        _count: true,
        where: { status: { in: [...PAID] } },
      }),
      this.prisma.booking.groupBy({ by: ["status"], _count: true }),
      this.prisma.booking.groupBy({
        by: ["listingId"],
        _count: true,
        _sum: { totalPrice: true },
        orderBy: { _count: { listingId: "desc" } },
        take: 5,
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      }),
    ]);

    const titles = await this.prisma.listing.findMany({
      where: { id: { in: topListings.map((t) => t.listingId) } },
      select: { id: true, title: true, city: true },
    });
    const titleMap = new Map(titles.map((t) => [t.id, t]));

    const revenue = Number(revenueAgg._sum.totalPrice ?? 0);
    return {
      revenue,
      commission: Math.round(revenue * 0.05),
      paidBookings: revenueAgg._count,
      last30dBookings: recentCount,
      byStatus: statusGroups.map((g) => ({ status: g.status, count: g._count })),
      topListings: topListings.map((t) => ({
        id: t.listingId,
        title: titleMap.get(t.listingId)?.title ?? "—",
        city: titleMap.get(t.listingId)?.city ?? "",
        bookings: t._count,
        revenue: Number(t._sum.totalPrice ?? 0),
      })),
    };
  }

  async users() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { bookings: true, reviews: true } } },
    });
    return {
      items: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        bookingsCount: u._count.bookings,
        reviewsCount: u._count.reviews,
        createdAt: u.createdAt.toISOString().slice(0, 10),
      })),
    };
  }

  async bookings() {
    const bookings = await this.prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        listing: { select: { title: true, city: true } },
        customer: { select: { name: true, email: true, phone: true } },
        unit: { select: { name: true } },
      },
    });
    return {
      items: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        listingTitle: b.listing.title,
        city: b.listing.city,
        unitName: b.unit.name,
        customer: b.customer.name ?? b.customer.email ?? b.customer.phone ?? "—",
        startDate: b.startDate.toISOString().slice(0, 10),
        endDate: b.endDate ? b.endDate.toISOString().slice(0, 10) : null,
        guests: b.guests,
        totalPrice: Number(b.totalPrice),
        createdAt: b.createdAt.toISOString().slice(0, 10),
      })),
    };
  }

  async reviews() {
    const reviews = await this.prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        listing: { select: { title: true } },
        customer: { select: { name: true } },
      },
    });
    return {
      items: reviews.map((r) => ({
        id: r.id,
        listingTitle: r.listing.title,
        author: r.customer.name ?? "Mehmon",
        rating: r.rating,
        comment: r.comment ?? "",
        createdAt: r.createdAt.toISOString().slice(0, 10),
      })),
    };
  }

  async deleteReview(id: string) {
    const r = await this.prisma.review.findUnique({ where: { id } });
    if (!r) throw new NotFoundException("Sharh topilmadi");
    await this.prisma.review.delete({ where: { id } });
    return { ok: true };
  }

  async feedback() {
    const items = await this.prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return {
      items: items.map((f) => ({
        id: f.id,
        type: f.type,
        name: f.name,
        email: f.email,
        message: f.message,
        status: f.status,
        createdAt: f.createdAt.toISOString().slice(0, 16).replace("T", " "),
      })),
    };
  }

  async setFeedbackStatus(id: string, status: "NEW" | "RESOLVED") {
    const f = await this.prisma.feedback.findUnique({ where: { id } });
    if (!f) throw new NotFoundException("Murojaat topilmadi");
    await this.prisma.feedback.update({ where: { id }, data: { status } });
    return { ok: true, status };
  }
}

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("vendors")
  vendors() {
    return this.admin.vendors();
  }

  @Patch("vendors/:id/status")
  setVendorStatus(@Param("id") id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.admin.setVendorStatus(id, dto.status);
  }

  @Get("listings")
  listings() {
    return this.admin.listings();
  }

  @Delete("listings/:id")
  deleteListing(@Param("id") id: string) {
    return this.admin.deleteListing(id);
  }

  @Post("business")
  createBusiness(@Body() dto: CreateBusinessDto) {
    return this.admin.createBusiness(dto);
  }

  @Get("reports")
  reports() {
    return this.admin.reports();
  }

  @Get("users")
  users() {
    return this.admin.users();
  }

  @Get("bookings")
  bookings() {
    return this.admin.bookings();
  }

  @Get("reviews")
  reviews() {
    return this.admin.reviews();
  }

  @Delete("reviews/:id")
  deleteReview(@Param("id") id: string) {
    return this.admin.deleteReview(id);
  }

  @Get("feedback")
  feedback() {
    return this.admin.feedback();
  }

  @Patch("feedback/:id/status")
  setFeedbackStatus(@Param("id") id: string, @Body() dto: UpdateFeedbackStatusDto) {
    return this.admin.setFeedbackStatus(id, dto.status);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
