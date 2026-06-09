import {
  BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Module, Injectable, NotFoundException,
} from "@nestjs/common";
import {
  IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
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

export class UpdateUnitDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) basePrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsString() beds?: string;
  @IsOptional() @IsString() size?: string;
}

export class UpdateBookingStatusDto {
  @IsIn(["CONFIRMED", "CANCELLED", "COMPLETED"]) status!: string;
}

export class UpdateListingDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) stars?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) basePrice?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
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

  /** Bitta e'lon — tahrirlash formasi uchun. */
  async getListing(userId: string, listingId: string) {
    const vendor = await this.ensureVendor(userId);
    const l = await this.prisma.listing.findFirst({
      where: { id: listingId, vendorId: vendor.id },
      include: { units: true },
    });
    if (!l) throw new NotFoundException("E'lon topilmadi");
    const attrs = (l.attributes ?? {}) as {
      stars?: number;
      district?: string;
      amenities?: string[];
    };
    const cheapest = [...l.units].sort((a, b) => Number(a.basePrice) - Number(b.basePrice))[0];
    return {
      id: l.id,
      title: l.title,
      city: l.city,
      district: attrs.district ?? "",
      description: l.description ?? "",
      stars: attrs.stars ?? 3,
      amenities: attrs.amenities ?? [],
      photos: l.photos,
      basePrice: cheapest ? Number(cheapest.basePrice) : 0,
      status: l.status,
      roomsCount: l.units.length,
    };
  }

  async updateListing(userId: string, listingId: string, dto: UpdateListingDto) {
    const vendor = await this.ensureVendor(userId);
    const l = await this.prisma.listing.findFirst({
      where: { id: listingId, vendorId: vendor.id },
      include: { units: true },
    });
    if (!l) throw new NotFoundException("E'lon topilmadi");
    const attrs = (l.attributes ?? {}) as Record<string, unknown>;

    const data: Prisma.ListingUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.photos !== undefined) data.photos = dto.photos;

    const newCity = dto.city ?? l.city;
    const newDistrict = dto.district ?? (attrs.district as string) ?? "";
    if (dto.city !== undefined || dto.district !== undefined) {
      data.address = newDistrict ? `${newDistrict}, ${newCity}` : newCity;
    }
    data.attributes = {
      ...attrs,
      ...(dto.stars !== undefined ? { stars: dto.stars } : {}),
      ...(dto.district !== undefined ? { district: dto.district } : {}),
      ...(dto.amenities !== undefined ? { amenities: dto.amenities } : {}),
    } as Prisma.InputJsonValue;

    await this.prisma.listing.update({ where: { id: listingId }, data });

    // Narx — eng arzon (asosiy) xonaga yoziladi
    if (dto.basePrice !== undefined && l.units.length) {
      const cheapest = [...l.units].sort((a, b) => Number(a.basePrice) - Number(b.basePrice))[0];
      await this.prisma.bookableUnit.update({
        where: { id: cheapest.id },
        data: { basePrice: dto.basePrice },
      });
    }
    return { ok: true };
  }

  async deleteListing(userId: string, listingId: string) {
    const vendor = await this.ensureVendor(userId);
    const l = await this.prisma.listing.findFirst({
      where: { id: listingId, vendorId: vendor.id },
    });
    if (!l) throw new NotFoundException("E'lon topilmadi");
    // bookings Listing'ga cascade emas — avval o'chiramiz. units/availability/reviews cascade.
    await this.prisma.$transaction([
      this.prisma.review.deleteMany({ where: { listingId } }),
      this.prisma.booking.deleteMany({ where: { listingId } }),
      this.prisma.listing.delete({ where: { id: listingId } }),
    ]);
    return { ok: true };
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

  /** E'lonning xonalari ro'yxati. */
  async listUnits(userId: string, listingId: string) {
    const vendor = await this.ensureVendor(userId);
    const l = await this.prisma.listing.findFirst({
      where: { id: listingId, vendorId: vendor.id },
      include: { units: { orderBy: { basePrice: "asc" } } },
    });
    if (!l) throw new NotFoundException("E'lon topilmadi");
    return {
      listingTitle: l.title,
      items: l.units.map((u) => {
        const a = (u.attributes ?? {}) as { beds?: string; size?: string };
        return {
          id: u.id,
          name: u.name,
          basePrice: Number(u.basePrice),
          capacity: u.capacity,
          beds: a.beds ?? "",
          size: a.size ?? "",
        };
      }),
    };
  }

  async updateUnit(userId: string, unitId: string, dto: UpdateUnitDto) {
    const vendor = await this.ensureVendor(userId);
    const unit = await this.prisma.bookableUnit.findFirst({
      where: { id: unitId, listing: { vendorId: vendor.id } },
    });
    if (!unit) throw new NotFoundException("Xona topilmadi");
    const a = (unit.attributes ?? {}) as { beds?: string; size?: string };
    const data: Prisma.BookableUnitUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.basePrice !== undefined) data.basePrice = dto.basePrice;
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.beds !== undefined || dto.size !== undefined) {
      data.attributes = {
        ...a,
        ...(dto.beds !== undefined ? { beds: dto.beds } : {}),
        ...(dto.size !== undefined ? { size: dto.size } : {}),
      } as Prisma.InputJsonValue;
    }
    await this.prisma.bookableUnit.update({ where: { id: unitId }, data });
    return { ok: true };
  }

  async deleteUnit(userId: string, unitId: string) {
    const vendor = await this.ensureVendor(userId);
    const unit = await this.prisma.bookableUnit.findFirst({
      where: { id: unitId, listing: { vendorId: vendor.id } },
    });
    if (!unit) throw new NotFoundException("Xona topilmadi");
    const count = await this.prisma.bookableUnit.count({ where: { listingId: unit.listingId } });
    if (count <= 1) throw new BadRequestException("E'londa kamida bitta xona qolishi kerak");
    // bookings unit'ga cascade emas — avval o'chiramiz. availability cascade.
    await this.prisma.$transaction([
      this.prisma.booking.deleteMany({ where: { unitId } }),
      this.prisma.bookableUnit.delete({ where: { id: unitId } }),
    ]);
    return { ok: true };
  }

  /** Vendor o'z e'loniga tegishli bronning holatini o'zgartiradi */
  async updateBookingStatus(userId: string, bookingId: string, status: string) {
    const vendor = await this.ensureVendor(userId);
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, listing: { vendorId: vendor.id } },
    });
    if (!booking) throw new NotFoundException("Bron topilmadi");
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as never },
    });
    return { id: updated.id, status: updated.status, ok: true };
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

  @Get("listings/:id")
  getListing(@CurrentUser() u: CurrentUserData, @Param("id") id: string) {
    return this.vendor.getListing(u.id, id);
  }

  @Patch("listings/:id")
  updateListing(@CurrentUser() u: CurrentUserData, @Param("id") id: string, @Body() dto: UpdateListingDto) {
    return this.vendor.updateListing(u.id, id, dto);
  }

  @Delete("listings/:id")
  deleteListing(@CurrentUser() u: CurrentUserData, @Param("id") id: string) {
    return this.vendor.deleteListing(u.id, id);
  }

  @Get("listings/:id/units")
  listUnits(@CurrentUser() u: CurrentUserData, @Param("id") id: string) {
    return this.vendor.listUnits(u.id, id);
  }

  @Post("listings/:id/units")
  addUnit(@CurrentUser() u: CurrentUserData, @Param("id") id: string, @Body() dto: AddUnitDto) {
    return this.vendor.addUnit(u.id, id, dto);
  }

  @Patch("units/:unitId")
  updateUnit(@CurrentUser() u: CurrentUserData, @Param("unitId") unitId: string, @Body() dto: UpdateUnitDto) {
    return this.vendor.updateUnit(u.id, unitId, dto);
  }

  @Delete("units/:unitId")
  deleteUnit(@CurrentUser() u: CurrentUserData, @Param("unitId") unitId: string) {
    return this.vendor.deleteUnit(u.id, unitId);
  }

  @Get("bookings")
  bookings(@CurrentUser() u: CurrentUserData) {
    return this.vendor.bookings(u.id);
  }

  @Patch("bookings/:id/status")
  updateBookingStatus(
    @CurrentUser() u: CurrentUserData,
    @Param("id") id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.vendor.updateBookingStatus(u.id, id, dto.status);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
