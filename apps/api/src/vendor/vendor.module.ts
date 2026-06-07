import {
  Body, Controller, Get, Param, Post, UseGuards, Module, Injectable, NotFoundException,
} from "@nestjs/common";
import {
  IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserData } from "../auth/current-user.decorator";

export class CreateListingDto {
  @IsString() title!: string;
  @IsString() city!: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(5) stars!: number;
  @Type(() => Number) @IsNumber() @Min(0) basePrice!: number;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
}

export class AddUnitDto {
  @IsString() name!: string;
  @Type(() => Number) @IsNumber() @Min(0) basePrice!: number;
  @Type(() => Number) @IsInt() @Min(1) capacity!: number;
  @IsOptional() @IsString() beds?: string;
  @IsOptional() @IsString() size?: string;
}

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  /** Vendor profilini olish yoki yaratish (dev: avtomatik tasdiq) */
  async ensureVendor(userId: string) {
    let vendor = await this.prisma.vendor.findUnique({ where: { ownerId: userId } });
    if (!vendor) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      vendor = await this.prisma.vendor.create({
        data: {
          ownerId: userId,
          name: user?.name ? `${user.name} Hotels` : "Mening biznesim",
          phone: user?.phone,
          status: "APPROVED",
        },
      });
      await this.prisma.user.update({ where: { id: userId }, data: { role: "VENDOR" } });
    }
    return vendor;
  }

  async me(userId: string) {
    const vendor = await this.ensureVendor(userId);
    const listingsCount = await this.prisma.listing.count({ where: { vendorId: vendor.id } });
    return { id: vendor.id, name: vendor.name, status: vendor.status, listingsCount };
  }

  async myListings(userId: string) {
    const vendor = await this.ensureVendor(userId);
    const listings = await this.prisma.listing.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      include: { units: true, _count: { select: { bookings: true } } },
    });
    return {
      items: listings.map((l) => ({
        id: l.id,
        title: l.title,
        city: l.city,
        photo: l.photos[0] ?? null,
        status: l.status,
        roomsCount: l.units.length,
        bookingsCount: l._count.bookings,
        minPrice: l.units.length ? Math.min(...l.units.map((u) => Number(u.basePrice))) : 0,
      })),
    };
  }

  async createListing(userId: string, dto: CreateListingDto) {
    const vendor = await this.ensureVendor(userId);
    const hotelCat = await this.prisma.category.findUniqueOrThrow({ where: { key: "hotel" } });

    const listing = await this.prisma.listing.create({
      data: {
        vendorId: vendor.id,
        categoryId: hotelCat.id,
        title: dto.title,
        city: dto.city,
        address: dto.district ? `${dto.district}, ${dto.city}` : dto.city,
        description: dto.description ?? "",
        photos: dto.photos ?? [],
        rating: 0,
        reviewCount: 0,
        status: "PUBLISHED",
        attributes: {
          stars: dto.stars,
          district: dto.district ?? "",
          amenities: dto.amenities ?? [],
          reviews: [],
        },
        units: {
          create: [
            {
              name: "Standart xona",
              unitType: "NIGHTLY",
              capacity: 2,
              basePrice: dto.basePrice,
              attributes: { roomKey: "std", beds: "1 katta krovat", size: "24 m²" },
            },
          ],
        },
      },
    });
    return { id: listing.id, ok: true };
  }

  async addUnit(userId: string, listingId: string, dto: AddUnitDto) {
    const vendor = await this.ensureVendor(userId);
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, vendorId: vendor.id },
    });
    if (!listing) throw new NotFoundException("E'lon topilmadi");
    const unit = await this.prisma.bookableUnit.create({
      data: {
        listingId,
        name: dto.name,
        unitType: "NIGHTLY",
        capacity: dto.capacity,
        basePrice: dto.basePrice,
        attributes: { beds: dto.beds ?? "", size: dto.size ?? "" },
      },
    });
    return { id: unit.id, ok: true };
  }

  async bookings(userId: string) {
    const vendor = await this.ensureVendor(userId);
    const bookings = await this.prisma.booking.findMany({
      where: { listing: { vendorId: vendor.id } },
      orderBy: { createdAt: "desc" },
      include: {
        unit: { select: { name: true } },
        listing: { select: { title: true, photos: true } },
        customer: { select: { name: true, phone: true } },
      },
    });
    return {
      items: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        listingTitle: b.listing.title,
        photo: b.listing.photos[0] ?? null,
        unitName: b.unit.name,
        guestName: b.customer.name ?? "Mehmon",
        guestPhone: b.customer.phone,
        startDate: b.startDate.toISOString().slice(0, 10),
        endDate: b.endDate ? b.endDate.toISOString().slice(0, 10) : null,
        guests: b.guests,
        totalPrice: Number(b.totalPrice),
      })),
    };
  }
}

@ApiTags("vendor")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("vendor")
export class VendorController {
  constructor(private readonly vendor: VendorService) {}

  @Get("me")
  me(@CurrentUser() u: CurrentUserData) {
    return this.vendor.me(u.id);
  }

  @Get("listings")
  listings(@CurrentUser() u: CurrentUserData) {
    return this.vendor.myListings(u.id);
  }

  @Post("listings")
  create(@CurrentUser() u: CurrentUserData, @Body() dto: CreateListingDto) {
    return this.vendor.createListing(u.id, dto);
  }

  @Post("listings/:id/units")
  addUnit(@CurrentUser() u: CurrentUserData, @Param("id") id: string, @Body() dto: AddUnitDto) {
    return this.vendor.addUnit(u.id, id, dto);
  }

  @Get("bookings")
  bookings(@CurrentUser() u: CurrentUserData) {
    return this.vendor.bookings(u.id);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
