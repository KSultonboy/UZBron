import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SitePage, PageHero } from "@/components/site-page";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "UZBron jamoasi bilan bog'laning. Savol, taklif yoki hamkorlik bo'yicha biz bilan aloqaga chiqing.",
};

const CHANNELS = [
  { icon: Phone, label: "Telefon", value: "+998 (90) 000-00-00", href: "tel:+998900000000" },
  { icon: Mail, label: "Email", value: "info@uzbron.uz", href: "mailto:info@uzbron.uz" },
  { icon: MessageCircle, label: "Telegram", value: "@uzbron", href: "https://t.me/uzbron" },
  { icon: MapPin, label: "Manzil", value: "Toshkent, O'zbekiston" },
];

export default function AloqaPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Aloqa"
        title="Biz bilan bog'laning"
        subtitle="Savol, taklif yoki hamkorlik bo'yicha murojaat qiling. Jamoamiz ish kunlari davomida tez orada javob beradi."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Channels */}
          <div>
            <h2 className="text-xl font-bold">Aloqa kanallari</h2>
            <p className="mt-2 text-sm text-muted">Sizga qulay usulni tanlang.</p>
            <ul className="mt-6 space-y-4">
              {CHANNELS.map((c) => {
                const inner = (
                  <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-[0_8px_24px_rgba(11,26,61,0.05)] transition hover:border-primary">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gold-soft text-gold">
                      <c.icon size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-subtle">{c.label}</div>
                      <div className="font-semibold text-ink">{c.value}</div>
                    </div>
                  </div>
                );
                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary-50 p-4 text-sm text-primary-dark">
              <Clock size={18} />
              <span>Ish vaqti: Dushanba–Shanba, 9:00–18:00</span>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-line bg-white p-7 shadow-[0_8px_24px_rgba(11,26,61,0.06)]">
            <h2 className="text-xl font-bold">Xabar yuborish</h2>
            <p className="mt-1 text-sm text-muted">Formani to&apos;ldiring — biz siz bilan bog&apos;lanamiz.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
