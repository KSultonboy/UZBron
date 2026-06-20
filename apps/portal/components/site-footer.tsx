import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platforma",
    links: [
      { label: "Mehmonxonalar", href: "/mehmonxonalar" },
      { label: "Biz haqimizda", href: "/haqida" },
      { label: "Aloqa", href: "/aloqa" },
    ],
  },
  {
    title: "Biznes uchun",
    links: [
      { label: "Hamkor bo'lish", href: "/bizneslar" },
      { label: "Biznes paneli", href: "/uzbron-partner-7f3" },
    ],
  },
  {
    title: "Yuridik",
    links: [
      { label: "Maxfiylik siyosati", href: "/maxfiylik" },
      { label: "Foydalanish shartlari", href: "/shartlar" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0b1a3d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" aria-label="UZBron">
            <Logo size={30} className="text-2xl text-white" bronClass="text-gold-light" />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
            O&apos;zbekiston bo&apos;ylab mehmonxona va xizmatlarni bir joyda bron qilish platformasi.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-white/65">
            <li className="flex items-center gap-2">
              <MapPin size={15} className="text-gold-light" /> Toshkent, O&apos;zbekiston
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-gold-light" /> +998 (90) 000-00-00
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-gold-light" /> info@uzbron.uz
            </li>
          </ul>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-white/85">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/55 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-white/45 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>© 2026 UZBron. Barcha huquqlar himoyalangan.</span>
          <span>O&apos;zbekiston Respublikasi · MChJ</span>
        </div>
      </div>
    </footer>
  );
}
