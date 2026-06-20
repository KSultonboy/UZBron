"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";

const NAV: { label: string; href: string }[] = [
  { label: "Mehmonxonalar", href: "/mehmonxonalar" },
  { label: "Biznes uchun", href: "/bizneslar" },
  { label: "Biz haqimizda", href: "/haqida" },
  { label: "Aloqa", href: "/aloqa" },
];

/** Inner-sahifalar uchun solid, sticky header. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? "border-line bg-white/95 backdrop-blur" : "border-transparent bg-white"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="text-xl font-bold text-ink" aria-label="UZBron bosh sahifa">
          UZ<span className="text-gold">Bron</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative transition hover:text-ink ${active ? "text-ink" : ""}`}
              >
                {item.label}
                {active && <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/uzbron-partner-7f3"
            className="hidden items-center gap-2 rounded-lg bg-[#0b1a3d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#13265a] sm:flex"
          >
            <UserRound size={17} />
            Kirish
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink md:hidden"
            aria-label="Menyu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line/60 py-3 text-sm font-medium text-ink last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/uzbron-partner-7f3"
              className="mt-3 mb-2 flex items-center justify-center gap-2 rounded-lg bg-[#0b1a3d] py-3 text-sm font-semibold text-white"
            >
              <UserRound size={17} /> Biznes paneli — Kirish
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
