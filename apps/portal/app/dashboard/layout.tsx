"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Boshqaruv paneli", icon: "▦" },
  { href: "/dashboard/listings", label: "Mehmonxonalarim", icon: "🏨" },
  { href: "/dashboard/bookings", label: "Bronlar", icon: "📅" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Yuklanmoqda...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-line bg-white">
        <div className="border-b border-line p-5 text-xl font-bold text-primary">
          UZBron <span className="font-medium text-gold">Biznes</span>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary-50 text-primary" : "text-muted hover:bg-canvas"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary">
              {(user.name ?? user.email ?? "B")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{user.name ?? "Hamkor"}</div>
              <div className="truncate text-xs text-muted">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-line py-2 text-sm font-medium text-muted hover:bg-canvas"
          >
            Chiqish
          </button>
        </div>
      </aside>

      {/* Asosiy kontent */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
