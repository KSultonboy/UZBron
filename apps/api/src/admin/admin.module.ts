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
}

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
