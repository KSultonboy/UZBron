"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  MapPin,
  Maximize,
  Star,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Room {
  id: string;
  name: string;
  capacity: number;
  beds: string;
  price: number;
  size: string;
}
interface Hotel {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  photos: string[];
  amenities: string[];
  rooms: Room[];
}

const SERVICE_FEE = 0.05;
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function HotelDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [roomId, setRoomId] = useState<string>("");
  const [checkIn, setCheckIn] = useState(todayISO(1));
  const [checkOut, setCheckOut] = useState(todayISO(2));
  const [guests, setGuests] = useState(2);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Hotel>(`/listings/${id}`, { auth: false })
      .then((h) => {
        setHotel(h);
        if (h.rooms?.[0]) setRoomId(h.rooms[0].id);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const room = useMemo(() => hotel?.rooms.find((r) => r.id === roomId), [hotel, roomId]);
  const nights = useMemo(() => {
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(0, Math.round((b - a) / 86400000));
  }, [checkIn, checkOut]);

  const subtotal = room ? room.price * Math.max(1, nights) : 0;
  const total = Math.round(subtotal * (1 + SERVICE_FEE));

  async function book() {
    setError(null);
    if (!user) {
      router.push("/kirish");
      return;
    }
    if (!room) return setError("Xona tanlang");
    if (nights < 1) return setError("Chiqish sanasi kirishdan keyin bo'lishi kerak");

    setBusy(true);
    try {
      await api("/bookings", {
        method: "POST",
        body: { unitId: room.id, startDate: checkIn, endDate: checkOut, guests },
      });
      router.push("/bronlarim");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bron qilishda xato yuz berdi");
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Mehmonxona topilmadi</h1>
        <p className="mt-2 text-muted">Bu e&apos;lon mavjud emas yoki o&apos;chirilgan.</p>
        <Link
          href="/mehmonxonalar"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b1a3d] px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft size={18} /> Mehmonxonalarga qaytish
        </Link>
      </div>
    );
  }

  if (!hotel) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Yuklanmoqda...</div>;
  }

  const photos = hotel.photos?.length ? hotel.photos : [FALLBACK_IMG];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <Link href="/mehmonxonalar" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> Mehmonxonalar
      </Link>

      {/* Sarlavha */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(hotel.stars || 0, 5) }).map((_, i) => (
              <Star key={i} size={13} className="fill-star text-star" />
            ))}
          </div>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{hotel.title}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={15} /> {hotel.city} · {hotel.district}
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-gold-soft px-3 py-2 text-sm font-bold text-gold">
          <Star size={15} className="fill-gold text-gold" /> {hotel.rating.toFixed(1)}
          <span className="font-medium text-muted">({hotel.reviewCount})</span>
        </div>
      </div>

      {/* Galereya */}
      <div className="mt-5 grid gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative aspect-[4/3] bg-line sm:col-span-2 sm:row-span-2 sm:aspect-auto">
          <Image src={photos[0]} alt={hotel.title} fill priority sizes="50vw" className="object-cover" />
        </div>
        {photos.slice(1, 5).map((p, i) => (
          <div key={i} className="relative hidden aspect-[4/3] bg-line sm:block">
            <Image src={p} alt="" fill sizes="25vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Chap: tavsif + xonalar */}
        <div>
          <h2 className="text-lg font-bold">Tavsif</h2>
          <p className="mt-2 leading-7 text-muted">{hotel.description || "Tavsif mavjud emas."}</p>

          {hotel.amenities.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base font-bold">Qulayliklar</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-ink">
                    <Check size={14} className="text-success" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-base font-bold">Xonalar</h3>
            <div className="mt-3 space-y-3">
              {hotel.rooms.map((r) => {
                const active = r.id === roomId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoomId(r.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                      active ? "border-primary bg-primary-50" : "border-line bg-white hover:border-primary"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold">{r.name}</div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        <span className="flex items-center gap-1"><Users size={14} /> {r.capacity} kishi</span>
                        {r.beds && <span className="flex items-center gap-1"><BedDouble size={14} /> {r.beds}</span>}
                        {r.size && <span className="flex items-center gap-1"><Maximize size={14} /> {r.size}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-bold">{r.price.toLocaleString("uz-UZ")}</div>
                      <div className="text-xs text-muted">so&apos;m / kecha</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* O'ng: bron paneli */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_12px_40px_rgba(11,26,61,0.08)]">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{(room?.price ?? hotel.price).toLocaleString("uz-UZ")}</span>
              <span className="text-sm text-muted">so&apos;m / kecha</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Kirish</span>
                <input
                  type="date"
                  value={checkIn}
                  min={todayISO()}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-11 w-full rounded-lg border border-line bg-canvas px-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Chiqish</span>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-11 w-full rounded-lg border border-line bg-canvas px-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-white"
                />
              </label>
            </div>

            <label className="mt-2 block">
              <span className="mb-1 block text-xs font-semibold text-muted">Mehmonlar</span>
              <div className="flex h-11 items-center justify-between rounded-lg border border-line bg-canvas px-3">
                <span className="flex items-center gap-2 text-sm"><Users size={16} className="text-muted" /> {guests} kishi</span>
                <span className="flex items-center gap-1">
                  <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink">−</button>
                  <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink">+</button>
                </span>
              </div>
            </label>

            {room && nights >= 1 && (
              <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>{room.price.toLocaleString("uz-UZ")} × {nights} kecha</span>
                  <span>{subtotal.toLocaleString("uz-UZ")}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Xizmat haqi (5%)</span>
                  <span>{(total - subtotal).toLocaleString("uz-UZ")}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                  <span>Jami</span>
                  <span>{total.toLocaleString("uz-UZ")} so&apos;m</span>
                </div>
              </div>
            )}

            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

            <button
              type="button"
              onClick={book}
              disabled={busy}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold text-sm font-bold text-[#1a1206] transition hover:bg-gold-light disabled:opacity-60"
            >
              <CalendarDays size={18} />
              {busy ? "Bron qilinmoqda..." : user ? "Bron qilish" : "Kirish va bron qilish"}
            </button>
            {!user && (
              <p className="mt-2 text-center text-xs text-subtle">Bron qilish uchun avval hisobingizga kiring.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
