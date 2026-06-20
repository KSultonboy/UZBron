import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  Scissors,
  Dumbbell,
  ArrowRight,
} from "lucide-react";
import { SitePage, PageHero } from "@/components/site-page";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description: "UZBron — O'zbekiston bo'ylab universal bron platformasi. Bizning maqsadimiz va kelajak rejalari.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Ishonch",
    text: "Har bir mehmonxona va hamkor tekshiriladi. Foydalanuvchi xavfsizligi — birinchi o'rinda.",
  },
  {
    icon: Sparkles,
    title: "Soddalik",
    text: "Bron qilish bir necha bosqichda. Murakkab jarayonlarni biz o'z zimmamizga olamiz.",
  },
  {
    icon: HeartHandshake,
    title: "Mahalliy biznes",
    text: "Mahalliy mehmonxona va xizmat ko'rsatuvchilarga raqamli o'sish imkonini beramiz.",
  },
];

const ROADMAP = [
  { icon: Building2, label: "Mehmonxonalar", status: "Hozir mavjud", active: true },
  { icon: UtensilsCrossed, label: "Restoranlar", status: "Tez orada" },
  { icon: Scissors, label: "Go'zallik & sartaroshxona", status: "Reja" },
  { icon: Stethoscope, label: "Klinika & shifokor", status: "Reja" },
  { icon: Dumbbell, label: "Sport maydonlari", status: "Reja" },
  { icon: Globe2, label: "Dacha & dam olish", status: "Reja" },
];

const STATS = [
  { value: "500+", label: "Mehmonxona" },
  { value: "12", label: "Shahar" },
  { value: "3", label: "Til (uz / ru / en)" },
  { value: "24/7", label: "Qo'llab-quvvatlash" },
];

export default function HaqidaPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Biz haqimizda"
        title="O'zbekiston uchun yagona bron platformasi"
        subtitle="UZBron — mehmonxona, restoran, klinika va boshqa xizmatlarni bitta ilovada bron qilish imkonini beruvchi raqamli platforma. Biz mehmonxonadan boshladik."
      />

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold">Bizning maqsad</span>
          <h2 className="mt-3 text-2xl font-bold leading-snug md:text-3xl">
            Xizmat bron qilishni telefon orqali bir necha daqiqada — har bir o&apos;zbekistonlik uchun qulay qilish.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Bugun mehmonxona band qilish ko&apos;pincha qo&apos;ng&apos;iroq, messenjer yoki tasodifga bog&apos;liq. Biz buni
            shaffof, ishonchli va onlayn jarayonga aylantiramiz — ham mijoz, ham biznes uchun. Arxitekturamiz boshidanoq
            universal qilib qurilgan: bugun mehmonxona, ertaga restoran, klinika va sport maydonlari.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Bizning qadriyatlar</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border border-line bg-white p-7 shadow-[0_8px_24px_rgba(11,26,61,0.06)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold-soft text-gold">
                <v.icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-[#0b1a3d] text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-gold-light">Kelajak rejalari</span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Bitta ilova — barcha xizmatlar</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/60">
              Platformamiz universal data modelga asoslangan. Yangi yo&apos;nalishni qo&apos;shish — yangi tur qo&apos;shish,
              tizimni qaytadan qurish emas.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROADMAP.map((r) => (
              <div
                key={r.label}
                className={`flex items-center gap-4 rounded-xl border p-5 ${
                  r.active ? "border-gold/40 bg-gold/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
                    r.active ? "bg-gold text-[#0b1a3d]" : "bg-white/10 text-white/80"
                  }`}
                >
                  <r.icon size={22} />
                </div>
                <div>
                  <div className="font-semibold">{r.label}</div>
                  <div className={`text-sm ${r.active ? "text-gold-light" : "text-white/45"}`}>{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-16 text-center lg:px-8">
        <CalendarCheck size={40} className="mx-auto text-gold" />
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">Biz bilan birga o&apos;sing</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Mehmonxona yoki xizmat egasimisiz? Bizning platformaga qo&apos;shilib, yangi mijozlarga chiqing.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/bizneslar"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-[#1a1206] transition hover:bg-gold-light"
          >
            Hamkor bo&apos;lish <ArrowRight size={18} />
          </Link>
          <Link
            href="/aloqa"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-primary"
          >
            Biz bilan bog&apos;lanish
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
