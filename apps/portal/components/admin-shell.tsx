"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Menu, ShieldCheck, Store, UserPlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ADMIN_BUSINESS, ADMIN_DASHBOARD, ADMIN_LISTINGS, ADMIN_ROOT, ADMIN_VENDORS } from "@/lib/admin-paths";

const nav = [
  { href: ADMIN_DASHBOARD, label: "Boshqaruv paneli", icon: LayoutDashboard },
  { href: ADMIN_VENDORS, label: "Bizneslar", icon: Store },
  { href: ADMIN_LISTINGS, label: "E'lonlar", icon: Building2 },
  { href: ADMIN_BUSINESS, label: "Biznes qo'shish", icon: UserPlus },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace(ADMIN_ROOT);
  }, [loading, user, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (loading || !user || user.role !== "ADMIN") {
    return <div className="grid min-h-screen place-items-center bg-canvas text-sm text-muted">Yuklanmoqda...</div>;
  }

  const signOut = () => {
    logout();
    router.replace(ADMIN_ROOT);
  };

  const Side = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-line px-5">
        <ShieldCheck size={20} className="text-primary" />
        <span className="text-lg font-bold text-primary">UZBron <span className="text-gold">Admin</span></span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === ADMIN_DASHBOARD ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                active ? "bg-primary text-white" : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <div className="truncate text-sm font-bold">{user.name ?? "Admin"}</div>
        <div className="truncate text-xs text-muted">{user.email}</div>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold text-muted transition hover:text-danger"
        >
          <LogOut size={16} /> Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <Side />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#0b1a3d]/50" onClick={() => setOpen(false)} aria-label="Yopish" />
          <aside className="relative flex h-full w-[86%] max-w-72 flex-col bg-white shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-muted" aria-label="Yopish">
              <X size={20} />
            </button>
            <Side />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-line" aria-label="Menyu">
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold">UZBron Admin</span>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}
