"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { FALLBACK_HOTELS, type PublicHotel } from "@/lib/public-listings";
import { HotelCard } from "@/components/hotel-card";
import { UZ_CITIES, UZ_REGIONS, citiesOfRegion, regionOfCity } from "@/lib/uz-regions";

type SortKey = "rating" | "price-asc" | "price-desc";

export function HotelsBrowser() {
  const [hotels, setHotels] = useState<PublicHotel[]>(FALLBACK_HOTELS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("rating");

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/listings?limit=60`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { items?: PublicHotel[] }) => {
        if (alive && data.items?.length) setHotels(data.items);
      })
      .catch(() => {
        /* fallback saqlanadi */
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Tanlangan viloyatga qarab shahar variantlari
  const cityOptions = useMemo(
    () => (region ? citiesOfRegion(region) : UZ_CITIES),
    [region],
  );

  const onRegionChange = (name: string) => {
    setRegion(name);
    setCity(""); // viloyat o'zgarsa shahar tanlovi tozalanadi
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = hotels.filter((h) => {
      const matchRegion = !region || regionOfCity(h.city)?.name === region;
      const matchCity = !city || h.city === city;
      const matchQuery =
        !q ||
        h.title.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q);
      return matchRegion && matchCity && matchQuery;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.rating - a.rating;
    });
    return list;
  }, [hotels, query, region, city, sort]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* Qidiruv + saralash paneli */}
      <div className="sticky top-[68px] z-20 -mx-5 mb-8 border-b border-line bg-canvas/95 px-5 py-4 backdrop-blur lg:rounded-xl lg:border lg:bg-white lg:px-5 lg:shadow-[0_8px_24px_rgba(11,26,61,0.06)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mehmonxona yoki shahar bo'yicha qidirish..."
              className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white lg:bg-canvas"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 rounded-lg border border-line bg-canvas px-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:bg-white"
            >
              <option value="rating">Reyting bo&apos;yicha</option>
              <option value="price-asc">Narx: arzonidan</option>
              <option value="price-desc">Narx: qimmatidan</option>
            </select>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <select
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
              className="h-11 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:bg-white"
            >
              <option value="">Barcha viloyatlar</option>
              {UZ_REGIONS.map((r) => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:bg-white"
          >
            <option value="">{region ? "Barcha shaharlar" : "Shahar (barchasi)"}</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Natijalar soni */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? "Yuklanmoqda..." : `${filtered.length} ta mehmonxona topildi`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white py-20 text-center">
          <p className="text-lg font-semibold text-ink">Hech narsa topilmadi</p>
          <p className="mt-1 text-sm text-muted">Boshqa shahar yoki qidiruv so&apos;zini sinab ko&apos;ring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}
    </section>
  );
}
