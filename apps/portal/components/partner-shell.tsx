"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  PARTNER_BOOKINGS,
  PARTNER_DASHBOARD,
  PARTNER_LISTINGS,
  PARTNER_ROOT,
} from "@/lib/portal-paths";

const navigation = [
  { href: PARTNER_DASHBOARD, label: "Boshqaruv paneli", icon: LayoutDashboard },
  { href: PARTNER_LISTINGS, label: "Mehmonxonalar", icon: Building2 },
  { href: PARTNER_BOOKINGS, label: "Bronlar", icon: CalendarDays },
];

export function PartnerShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace(PARTNER_ROOT);
  }, [loading, user, router]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm text-muted">
        Panel yuklanmoqda...
      </div>
    );
  }

  const signOut = () => {
    logout();
    router.replace(PARTNER_ROOT);
  };

  return (
    <div className="min-h-screen bg-canvas lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <SidebarContent pathname={pathname} user={user} onLogout={signOut} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0b1a3d]/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Menyuni yopish"
          />
          <aside className="relative flex h-full w-[86%] max-w-72 flex-col bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-canvas"
              aria-label="Menyuni yopish"
              title="Yopish"
            >
              <X size={20} />
            </button>
            <SidebarContent pathname={pathname} user={user} onLogout={signOut} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink lg:hidden"
            aria-label="Menyuni ochish"
            title="Menyu"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="text-xs font-medium text-muted">UZBron Partner</div>
            <div className="text-sm font-bold text-ink">{pageTitle(pathname)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={16} />
            <input
              className="h-10 w-56 rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              placeholder="Panel bo'ylab qidirish"
            />
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted hover:bg-canvas"
            aria-label="Bildirishnomalar"
            title="Bildirishnomalar"
          >
            <Bell size={18} />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
            {(user.name ?? user.email ?? "H")[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  onLogout,
}: {
  pathname: string;
  user: { name: string | null; email: string | null };
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Link href={PARTNER_DASHBOARD} className="text-lg font-bold text-primary">
          UZ<span className="text-gold">Bron</span>
          <span className="ml-1.5 text-xs font-semibold text-muted">Partner</span>
        </Link>
        <PanelLeftClose size={18} className="hidden text-subtle lg:block" />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <div className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase text-subtle">Boshqaruv</div>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active =
            href === PARTNER_DASHBOARD ? pathname === href : pathname.startsWith(href);
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
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-sm font-bold text-primary">
            {(user.name ?? user.email ?? "H")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{user.name ?? "Hamkor"}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold text-muted transition hover:bg-canvas hover:text-danger"
        >
          <LogOut size={16} />
          Chiqish
        </button>
      </div>
    </>
  );
}

function pageTitle(pathname: string) {
  if (pathname.includes("/listings/new")) return "Yangi mehmonxona";
  if (pathname.includes("/listings")) return "Mehmonxonalar";
  if (pathname.includes("/bookings")) return "Bronlar";
  return "Boshqaruv paneli";
}
