import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto";

const SERVICE_FEE = 0.05;

type BookingFull = Prisma.BookingGetPayload<{
  include: { unit: true; listing: { select: { title: true; photos: true; city: true } } };
}>;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const start = new Date(dto.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : new Date(start.getTime() + 86400000);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));

    const booking = await this.prisma.$transaction(async (tx) => {
      const unit = await tx.bookableUnit.findUnique({
        where: { id: dto.unitId },
        include: { listing: { select: { id: true } } },
      });
      if (!unit) throw new NotFoundException("Xona topilmadi");
      if (dto.guests > unit.capacity + 2)
        throw new BadRequestException("Mehmonlar soni xona sig'imidan ko'p");

      // Bir xil xona uchun sana kesishuvini tekshirish (ikki marta band bo'lmasligi uchun)
      const overlap = await tx.booking.findFirst({
        where: {
          unitId: dto.unitId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startDate: { lt: end },
          endDate: { gt: start },
        },
      });
      if (overlap) throw new ConflictException("Bu xona tanlangan sanalarda band");

      const price = Number(unit.basePrice);
      const subtotal = price * nights;
      const total = Math.round(subtotal * (1 + SERVICE_FEE));

      return tx.booking.create({
        data: {
          customerId: userId,
          listingId: unit.listing.id,
          unitId: unit.id,
          startDate: start,
          endDate: end,
          guests: dto.guests,
          totalPrice: total,
          note: dto.note ?? null,
          status: "CONFIRMED",
        },
        include: {
          unit: true,
          listing: { select: { title: true, photos: true, city: true } },
        },
      });
    });

    return this.map(booking);
  }

  async listMine(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        unit: true,
        listing: { select: { title: true, photos: true, city: true } },
      },
    });
    return { items: bookings.map((b) => this.map(b)) };
  }

  async cancel(userId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Bron topilmadi");
    if (booking.customerId !== userId) throw new ForbiddenException();
    if (!["PENDING", "CONFIRMED"].includes(booking.status))
      throw new BadRequestException("Bu bronni bekor qilib bo'lmaydi");

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        unit: true,
        listing: { select: { title: true, photos: true, city: true } },
      },
    });
    return this.map(updated);
  }

  private map(b: BookingFull) {
    const nights = b.endDate
      ? Math.max(1, Math.round((b.endDate.getTime() - b.startDate.getTime()) / 86400000))
      : 1;
    return {
      id: b.id,
      status: b.status,
      listingId: b.listingId,
      listingTitle: b.listing.title,
      listingPhoto: b.listing.photos[0] ?? null,
      city: b.listing.city,
      unitId: b.unitId,
      unitName: b.unit.name,
      startDate: b.startDate.toISOString().slice(0, 10),
      endDate: b.endDate ? b.endDate.toISOString().slice(0, 10) : null,
      nights,
      guests: b.guests,
      totalPrice: Number(b.totalPrice),
      note: b.note,
      createdAt: b.createdAt.toISOString(),
    };
  }
}
