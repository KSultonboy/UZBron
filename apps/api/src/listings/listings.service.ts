import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface SearchParams {
  category?: string;
  q?: string;
  city?: string;
  sort?: "rating" | "price_asc" | "price_desc" | "newest";
  limit?: string;
}

type ListingWithUnits = Prisma.ListingGetPayload<{ include: { units: true } }>;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Qidiruv / filtr / saralash */
  async search(params: SearchParams) {
    const { category = "hotel", q, city, sort = "rating", limit = "50" } = params;

    const cat = await this.prisma.category.findUnique({ where: { key: category } });

    const where: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
      ...(cat ? { categoryId: cat.id } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const listings = await this.prisma.listing.findMany({
      where,
      include: { units: true },
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    let items = listings.map((l) => this.toHotel(l, false));

    if (sort === "price_asc") items = items.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") items = items.sort((a, b) => b.price - a.price);
    else if (sort === "rating") items = items.sort((a, b) => b.rating - a.rating);

    return { items, total: items.length };
  }

  /** Bitta mehmonxona — xonalar va sharhlar bilan */
  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        units: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { customer: { select: { name: true } } },
        },
      },
    });
    if (!listing) throw new NotFoundException("Mehmonxona topilmadi");

    const hotel = this.toHotel(listing, true);
    // Real sharhlar (Review jadvali) + seed (attributes) sharhlar
    const realReviews = listing.reviews.map((r) => {
      const name = r.customer.name ?? "Mehmon";
      const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
      return {
        id: r.id,
        author: name,
        initials,
        rating: r.rating,
        date: r.createdAt.toLocaleDateString("uz-UZ"),
        text: r.comment ?? "",
      };
    });
    return { ...hotel, reviews: [...realReviews, ...((hotel.reviews as unknown[]) ?? [])] };
  }

  /** Prisma Listing -> frontend kutadigan "hotel" shakliga o'tkazish */
  private toHotel(l: ListingWithUnits, withReviews: boolean) {
    const attrs = (l.attributes ?? {}) as Record<string, unknown>;
    const units = [...l.units].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    const prices = units.map((u) => Number(u.basePrice));
    const price = prices.length ? Math.min(...prices) : 0;

    const rooms = units.map((u) => {
      const ua = (u.attributes ?? {}) as Record<string, unknown>;
      return {
        id: u.id, // real BookableUnit ID (bron uchun)
        name: u.name,
        capacity: u.capacity,
        beds: (ua.beds as string) ?? "",
        price: Number(u.basePrice),
        size: (ua.size as string) ?? "",
      };
    });

    return {
      id: l.id,
      title: l.title,
      description: l.description ?? "",
      city: l.city ?? "",
      district: (attrs.district as string) ?? l.address ?? "",
      stars: (attrs.stars as number) ?? 0,
      rating: l.rating,
      reviewCount: l.reviewCount,
      price,
      photos: l.photos,
      badge: (attrs.badge as string | null) ?? undefined,
      distanceKm: (attrs.distanceKm as number | null) ?? undefined,
      amenities: (attrs.amenities as string[]) ?? [],
      rooms,
      ...(withReviews ? { reviews: (attrs.reviews as unknown[]) ?? [] } : {}),
    };
  }
}
