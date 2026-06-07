"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BedDouble, Building2, CalendarDays, MapPin, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import { PARTNER_LISTINGS } from "@/lib/portal-paths";

interface VendorListing {
  id: string;
  title: string;
  city: string;
  photo: string | null;
  status: string;
  roomsCount: number;
  bookingsCount: number;
  minPrice: number;
}

function money(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

export default function PartnerListingsPage() {
  const [items, setItems] = useState<VendorListing[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: VendorListing[] }>("/vendor/listings")
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  const visible = items.filter((item) =>
    `${item.title} ${item.city}`.toLocaleLowerCase("uz").includes(query.toLocaleLowerCase("uz")),
  );

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Mehmonxonalar</h1>
          <p className="mt-2 text-sm text-muted">E&apos;lonlar, xonalar va narxlarni boshqaring.</p>
        </div>
        <Link
          href={`${PARTNER_LISTINGS}/new`}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Yangi mehmonxona
        </Link>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-4 text-sm outline-none focus:border-primary"
            placeholder="Mehmonxona yoki shahar..."
          />
        </div>
        <div className="text-sm text-muted">
          Jami: <span className="font-bold text-ink">{items.length}</span> ta e&apos;lon
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 rounded-lg bg-white" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="flex gap-4 p-4">
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  {item.photo ? (
                    <Image
                      src={item.photo}
                      alt={item.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-subtle">
                      <Building2 size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate font-bold">{item.title}</h2>
                    <span className="rounded-lg bg-[#effaf6] px-2 py-1 text-[10px] font-bold text-success">
                      {item.status === "PUBLISHED" ? "Faol" : item.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <MapPin size={13} />
                    {item.city}
                  </div>
                  <div className="mt-3 text-sm font-bold">{money(item.minPrice)} so&apos;mdan</div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-line border-t border-line bg-canvas/60">
                <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted">
                  <BedDouble size={15} />
                  <span><b className="text-ink">{item.roomsCount}</b> xona</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted">
                  <CalendarDays size={15} />
                  <span><b className="text-ink">{item.bookingsCount}</b> bron</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center">
          <Building2 className="mx-auto text-subtle" size={38} />
          <h2 className="mt-4 font-bold">{items.length ? "Natija topilmadi" : "Birinchi mehmonxonani qo'shing"}</h2>
          <p className="mt-2 text-sm text-muted">
            {items.length ? "Qidiruv so'rovini o'zgartiring." : "E'lon ma'lumotlari mobil ilovada ham ko'rinadi."}
          </p>
        </div>
      )}
    </div>
  );
}
