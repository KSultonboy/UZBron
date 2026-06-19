"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Compass,
  Dumbbell,
  Headphones,
  Heart,
  Home,
  House,
  MapPin,
  Scissors,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Stethoscope,
  UserRound,
  Utensils,
  UsersRound,
} from "lucide-react";
import { API_BASE } from "@/lib/config";
import { CITY_CARDS, FALLBACK_HOTELS, type PublicHotel } from "@/lib/public-listings";
import { CountUp, EASE, Reveal, Stagger, staggerItem } from "@/components/motion";

const categories = [
  { key: "hotel", label: "Mehmonxona", icon: BedDouble, active: true },
  { key: "dacha", label: "Dacha", icon: House, active: false },
  { key: "restaurant", label: "Restoran", icon: Utensils, active: false },
  { key: "salon", label: "Salon", icon: Scissors, active: false },
  { key: "clinic", label: "Klinika", icon: Stethoscope, active: false },
  { key: "sport", label: "Sport", icon: Dumbbell, active: false },
];

const benefits = [
  { icon: ShieldCheck, title: "Ishonchli bron", text: "Tasdiqlangan joylar va himoyalangan ma'lumotlar." },
  { icon: BadgeCheck, title: "Eng yaxshi narx", text: "Yashirin to'lovlarsiz aniq va tushunarli narxlar." },
  { icon: Headphones, title: "Doimiy yordam", text: "Bron jarayonida siz bilan birga bo'ladigan yordam xizmati." },
];

function money(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

export function PublicSite() {
  const [hotels, setHotels] = useState<PublicHotel[]>(FALLBACK_HOTELS);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/listings?category=hotel&sort=rating&limit=12`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Listings unavailable");
        return response.json();
      })
      .then((data: { items?: PublicHotel[] }) => {
        if (data.items?.length) setHotels(data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visibleHotels = useMemo(() => {
    const normalized = activeQuery.trim().toLocaleLowerCase("uz");
    return hotels.filter((hotel) => {
      const matchesQuery =
        !normalized ||
        hotel.title.toLocaleLowerCase("uz").includes(normalized) ||
        hotel.city.toLocaleLowerCase("uz").includes(normalized) ||
        hotel.district.toLocaleLowerCase("uz").includes(normalized);
      const matchesCity = !selectedCity || hotel.city === selectedCity;
      return matchesQuery && matchesCity;
    });
  }, [activeQuery, hotels, selectedCity]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setActiveQuery(query);
    document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
  };

  const chooseCity = (city: string) => {
    setSelectedCity((current) => (current === city ? "" : city));
    document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
  };

  // Hero entrance (mount) — staggered children.
  const heroContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const heroItem = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <div className="min-h-screen bg-canvas pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-ink md:pb-0">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#" className="text-xl font-bold text-white" aria-label="UZBron bosh sahifa">
            UZ<span className="text-gold-light">Bron</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
            {[
              ["#hotels", "Mehmonxonalar"],
              ["#cities", "Shaharlar"],
              ["#why-us", "Afzalliklar"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="relative transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
              aria-label="Bildirishnomalar"
              title="Bildirishnomalar"
            >
              <Bell size={19} />
            </button>
            <button
              type="button"
              className="hidden items-center gap-2 rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:flex"
            >
              <UserRound size={17} />
              Kirish
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          ref={heroRef}
          className="relative flex min-h-[690px] items-end overflow-hidden pb-12 pt-28 md:min-h-[720px] md:items-center md:pb-16"
        >
          <motion.div className="absolute inset-x-0 -top-[6%] h-[118%]" style={{ y: reduce ? 0 : heroImageY }}>
            <Image
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=90"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          <motion.div className="absolute inset-0 bg-[#0b1a3d]/70" style={{ opacity: reduce ? 0.7 : heroFade }} />
          {/* gold glow accent */}
          <div
            className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(234,179,8,0.22), transparent 70%)" }}
          />

          <motion.div
            className="relative mx-auto w-full max-w-7xl px-5 lg:px-8"
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            <div className="max-w-3xl">
              <motion.div variants={heroItem} className="mb-4 flex items-center gap-2 text-sm font-medium text-white/75">
                <MapPin size={16} className="text-gold-light" />
                Toshkent, O&apos;zbekiston
                <ChevronDown size={15} />
              </motion.div>
              <motion.h1 variants={heroItem} className="text-5xl font-bold text-white sm:text-6xl md:text-7xl" style={{ letterSpacing: "-0.03em" }}>
                UZBron
              </motion.h1>
              <motion.p variants={heroItem} className="mt-4 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl" style={{ textWrap: "balance" } as React.CSSProperties}>
                O&apos;zbekistonda mukammal dam olish joyini bron qiling
              </motion.p>
              <motion.p variants={heroItem} className="mt-4 max-w-xl text-base leading-7 text-white/75">
                Mehmonxona va dam olish maskanlarini bir joyda solishtiring, ishonchli bron qiling.
              </motion.p>
            </div>

            <motion.form
              variants={heroItem}
              onSubmit={submitSearch}
              className="mt-8 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-lg bg-line shadow-2xl md:grid-cols-[1.5fr_1fr_1fr_.8fr_auto]"
            >
              <label className="col-span-2 flex min-h-16 items-center gap-3 bg-white px-4 md:col-span-1 md:min-h-20 md:px-5">
                <Search className="shrink-0 text-primary" size={21} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-muted">Qayerga?</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-subtle"
                    placeholder="Shahar yoki mehmonxona"
                  />
                </span>
              </label>
              <button type="button" className="flex min-h-16 items-center gap-2 bg-white px-3 text-left transition hover:bg-canvas md:min-h-20 md:gap-3 md:px-5">
                <CalendarDays className="shrink-0 text-primary" size={20} />
                <span>
                  <span className="block text-xs font-semibold text-muted">Kirish</span>
                  <span className="mt-1 block text-sm font-medium">Sanani tanlang</span>
                </span>
              </button>
              <button type="button" className="flex min-h-16 items-center gap-2 bg-white px-3 text-left transition hover:bg-canvas md:min-h-20 md:gap-3 md:px-5">
                <CalendarDays className="shrink-0 text-primary" size={20} />
                <span>
                  <span className="block text-xs font-semibold text-muted">Chiqish</span>
                  <span className="mt-1 block text-sm font-medium">Sanani tanlang</span>
                </span>
              </button>
              <button type="button" className="flex min-h-16 items-center gap-2 bg-white px-3 text-left transition hover:bg-canvas md:min-h-20 md:gap-3 md:px-5">
                <UsersRound className="shrink-0 text-primary" size={20} />
                <span>
                  <span className="block text-xs font-semibold text-muted">Mehmonlar</span>
                  <span className="mt-1 block text-sm font-medium">2 kishi</span>
                </span>
              </button>
              <motion.button
                type="submit"
                whileHover={reduce ? undefined : { scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex min-h-16 items-center justify-center gap-2 bg-gold px-4 font-semibold text-white md:min-h-20 md:px-7"
              >
                <Search size={19} />
                Qidirish
              </motion.button>
            </motion.form>
          </motion.div>
        </section>

        <section className="relative z-10 -mt-1 border-b border-line bg-white">
          <div className="mx-auto max-w-7xl overflow-x-auto px-5 py-5 lg:px-8">
            <div className="flex min-w-max items-start gap-3 md:min-w-0 md:justify-between">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    type="button"
                    key={category.key}
                    disabled={!category.active}
                    whileHover={category.active && !reduce ? { y: -3 } : undefined}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={`flex w-24 shrink-0 flex-col items-center gap-2 rounded-lg px-2 py-3 text-center ${
                      category.active ? "bg-primary-50 text-primary" : "cursor-not-allowed text-subtle"
                    }`}
                  >
                    <Icon size={25} strokeWidth={1.8} />
                    <span className="text-xs font-semibold">{category.label}</span>
                    {!category.active && <span className="text-[10px]">tez orada</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="hotels" className="scroll-mt-16 py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gold">Eng yaxshi tanlovlar</p>
                <h2 className="mt-2 text-3xl font-bold md:text-4xl">Tavsiya etilgan</h2>
              </div>
              <button type="button" className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5 sm:flex">
                Hammasini ko&apos;rish
                <ChevronRight size={17} />
              </button>
            </Reveal>

            {(activeQuery || selectedCity) && (
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                <SlidersHorizontal size={16} className="text-primary" />
                <span className="text-muted">Faol filtr:</span>
                {activeQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveQuery("");
                    }}
                    className="rounded-lg bg-primary-50 px-3 py-1.5 font-medium text-primary"
                  >
                    {activeQuery} ×
                  </button>
                )}
                {selectedCity && (
                  <button type="button" onClick={() => setSelectedCity("")} className="rounded-lg bg-gold-soft px-3 py-1.5 font-medium text-gold">
                    {selectedCity} ×
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[390px] animate-pulse rounded-lg bg-white" />
                ))}
              </div>
            ) : visibleHotels.length ? (
              <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {visibleHotels.slice(0, 8).map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} reduce={!!reduce} />
                ))}
              </Stagger>
            ) : (
              <div className="mt-8 border border-dashed border-line bg-white px-6 py-16 text-center">
                <BedDouble className="mx-auto text-subtle" size={40} />
                <h3 className="mt-4 text-lg font-bold">Mos joy topilmadi</h3>
                <p className="mt-2 text-sm text-muted">Qidiruv yoki shahar filtrini o&apos;zgartiring.</p>
              </div>
            )}
          </div>
        </section>

        <section id="cities" className="scroll-mt-16 bg-white py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-2xl">
              <p className="text-sm font-semibold text-gold">O&apos;zbekiston bo&apos;ylab</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Mashhur shaharlar</h2>
              <p className="mt-3 text-muted">Tarix, zamonaviy qulaylik va milliy mehmondo&apos;stlik bir joyda.</p>
            </Reveal>
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CITY_CARDS.map((city) => (
                <motion.button
                  type="button"
                  variants={staggerItem}
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  onClick={() => chooseCity(city.name)}
                  key={city.name}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg text-left"
                >
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a3d]/80 via-[#0b1a3d]/20 to-transparent transition group-hover:from-[#0b1a3d]/90" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="text-xl font-bold">{city.name}</div>
                    <div className="mt-1 text-sm text-white/85">
                      <CountUp to={city.count} /> ta joy
                    </div>
                  </div>
                </motion.button>
              ))}
            </Stagger>
          </div>
        </section>

        <section id="why-us" className="scroll-mt-16 py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
              <Reveal>
                <p className="text-sm font-semibold text-gold">Nega UZBron?</p>
                <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl" style={{ textWrap: "balance" } as React.CSSProperties}>
                  Sayohatni rejalash endi ancha oson
                </h2>
                <p className="mt-4 max-w-lg leading-7 text-muted">
                  Mahalliy bozor uchun yaratilgan platforma, tushunarli narxlar va tez bron jarayoni.
                </p>
              </Reveal>
              <Stagger className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div variants={staggerItem} key={benefit.title} className="bg-white p-6">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
                        <Icon size={22} />
                      </div>
                      <h3 className="mt-5 font-bold">{benefit.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{benefit.text}</p>
                    </motion.div>
                  );
                })}
              </Stagger>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-primary py-12 text-white">
          <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold text-gold-light">UZBron mobil ilovasi</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Bronlaringiz doim yoningizda</h2>
              <p className="mt-2 text-sm text-white/70">Saqlangan joylar, bronlar va bildirishnomalarni bir ilovada boshqaring.</p>
            </div>
            <motion.button
              type="button"
              whileHover={reduce ? undefined : { scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-primary"
            >
              Ilovani yuklab olish
              <ArrowRight size={18} />
            </motion.button>
          </Reveal>
        </section>
      </main>

      <footer className="bg-[#0b1a3d] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-xl font-bold">
              UZ<span className="text-gold-light">Bron</span>
            </div>
            <p className="mt-2 text-sm text-white/55">O&apos;zbekiston bo&apos;ylab ishonchli bron platformasi.</p>
          </div>
          <div className="text-sm text-white/55">© 2026 UZBron. Barcha huquqlar himoyalangan.</div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4" style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}>
          <MobileNav icon={Home} label="Asosiy" active />
          <MobileNav icon={Compass} label="Qidiruv" href="#hotels" />
          <MobileNav icon={CalendarDays} label="Bronlar" />
          <MobileNav icon={UserRound} label="Profil" />
        </div>
      </nav>
    </div>
  );
}

function HotelCard({ hotel, reduce }: { hotel: PublicHotel; reduce: boolean }) {
  const photo =
    hotel.photos?.[0] ??
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

  return (
    <motion.article
      variants={staggerItem}
      whileHover={reduce ? undefined : { y: -8 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="group overflow-hidden rounded-lg border border-line bg-white shadow-[0_8px_24px_rgba(11,26,61,0.07)] hover:shadow-[0_20px_48px_rgba(11,26,61,0.16)]"
    >
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
        <button
          type="button"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:scale-110 hover:text-danger"
          aria-label={`${hotel.title}ni saqlash`}
          title="Saqlash"
        >
          <Heart size={18} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(hotel.stars || 0, 5) }).map((_, index) => (
            <Star key={index} size={12} className="fill-star text-star" />
          ))}
        </div>
        <h3 className="mt-2 truncate text-lg font-bold">{hotel.title}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} />
          <span className="truncate">{hotel.city} · {hotel.district}</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <div className="text-lg font-bold">{money(hotel.price)} <span className="text-xs font-normal text-muted">so&apos;m</span></div>
            <div className="text-xs text-muted">1 kecha uchun</div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star size={15} className="fill-star text-star" />
            <span className="font-bold">{hotel.rating.toFixed(1)}</span>
            <span className="text-muted">({hotel.reviewCount})</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MobileNav({
  icon: Icon,
  label,
  active = false,
  href = "#",
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
  href?: string;
}) {
  return (
    <a
      href={href}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
        active ? "text-primary" : "text-subtle"
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
      {label}
    </a>
  );
}
