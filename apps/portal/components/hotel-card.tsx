import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { PublicHotel } from "@/lib/public-listings";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

export function HotelCard({ hotel }: { hotel: PublicHotel }) {
  const photo = hotel.photos?.[0] ?? FALLBACK_IMG;
  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-white shadow-[0_8px_24px_rgba(11,26,61,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(11,26,61,0.16)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        <Image
          src={photo}
          alt={hotel.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        {hotel.badge && (
          <div className="absolute left-3 top-3 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gold shadow-sm">
            {hotel.badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(hotel.stars || 0, 5) }).map((_, i) => (
            <Star key={i} size={12} className="fill-star text-star" />
          ))}
        </div>
        <h3 className="mt-2 truncate text-lg font-bold">{hotel.title}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} />
          <span className="truncate">
            {hotel.city} · {hotel.district}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
          <div>
            <span className="text-lg font-bold text-ink">{hotel.price.toLocaleString("uz-UZ")}</span>
            <span className="text-sm text-muted"> so&apos;m / kecha</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-gold-soft px-2 py-1 text-sm font-bold text-gold">
            <Star size={13} className="fill-gold text-gold" />
            {hotel.rating.toFixed(1)}
          </div>
        </div>
      </div>
    </article>
  );
}
