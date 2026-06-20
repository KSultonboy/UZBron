import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  UserPlus,
} from "lucide-react";
import { SitePage, PageHero } from "@/components/site-page";
import { VendorApplyForm } from "@/components/vendor-apply-form";

export const metadata: Metadata = {
  title: "Biznes uchun",
  description: "Mehmonxonangizni UZBron platformasiga joylang. Yangi mijozlar, onlayn bronlar va qulay boshqaruv paneli.",
};

const BENEFITS = [
  { icon: Megaphone, title: "Yangi mijozlar", text: "Butun O'zbekiston bo'ylab minglab foydalanuvchilarga ko'rinasiz." },
  { icon: CalendarRange, title: "Onlayn bronlar", text: "Bronlar avtomatik keladi — qo'ng'iroq va qo'lda yozuvga hojat yo'q." },
  { icon: LayoutDashboard, title: "Qulay panel", text: "E'lon, xona, narx va bronlarni bitta joydan boshqaring." },
  { icon: BarChart3, title: "Statistika", text: "Ko'rishlar, bronlar va daromadni real vaqtda kuzating." },
  { icon: ImageIcon, title: "Professional e'lon", text: "Rasm, tavsif va qulayliklar bilan jozibali sahifa yarating." },
  { icon: CreditCard, title: "To'lovga tayyor", text: "Payme va Click integratsiyasi bosqichma-bosqich qo'shilmoqda." },
];

const STEPS = [
  { icon: UserPlus, title: "Ro'yxatdan o'ting", text: "Biznes hisobingizni yarating va ma'lumotlaringizni kiriting." },
  { icon: ImageIcon, title: "E'lon joylang", text: "Mehmonxona, xonalar, narx va rasmlarni qo'shing." },
  { icon: CheckCircle2, title: "Tasdiqlang", text: "Jamoamiz e'loningizni tekshiradi va faollashtiradi." },
  { icon: CalendarRange, title: "Bronlarni qabul qiling", text: "Mijozlar bron qiladi, siz panel orqali boshqarasiz." },
];

export default function BizneslarPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Hamkorlik"
        title="Biznesingizni onlayn bronlar bilan o'stiring"
        subtitle="Mehmonxona, dam olish maskani yoki xizmat egasimisiz? UZBron sizni minglab mijozlar bilan bog'laydi — komissiya faqat real bronlar uchun."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="#ariza"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-[#1a1206] transition hover:bg-gold-light"
          >
            Hamkor bo&apos;lish <ArrowRight size={18} />
          </Link>
          <Link
            href="/aloqa"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Savol berish
          </Link>
        </div>
      </PageHero>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold">Nega UZBron?</span>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">Hamkorlik nima beradi</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-xl border border-line bg-white p-7 shadow-[0_8px_24px_rgba(11,26,61,0.06)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
                <b.icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-gold">4 bosqich</span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Qanday boshlash mumkin</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#0b1a3d] text-gold-light">
                  <s.icon size={26} />
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wide text-subtle">Qadam {i + 1}</div>
                <h3 className="mt-1 text-base font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ariza */}
      <section id="ariza" className="scroll-mt-24 border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-gold">Hamkor bo&apos;lish</span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Ariza qoldiring — biz bog&apos;lanamiz</h2>
            <p className="mt-3 max-w-md leading-7 text-muted">
              Ro&apos;yxatdan o&apos;tish bepul. To&apos;lov faqat amalga oshgan bronlardan. Arizangiz ko&apos;rib chiqilgach,
              kiritgan email va parolingiz bilan biznes panelingizga kira olasiz.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              {["Komissiya faqat real bronlardan", "Qulay biznes paneli", "Mijozlarga to'g'ridan-to'g'ri chiqish"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <VendorApplyForm />
        </div>
      </section>
    </SitePage>
  );
}
