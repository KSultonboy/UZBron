"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CalendarDays, Clock, Store, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { ADMIN_VENDORS } from "@/lib/admin-paths";

interface Stats {
  users: number;
  vendors: number;
  listings: number;
  bookings: number;
  pendingVendors: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: "Foydalanuvchilar", value: stats?.users, icon: UsersRound, tone: "bg-primary-50 text-primary" },
    { label: "Bizneslar", value: stats?.vendors, icon: Store, tone: "bg-[#effaf6] text-success" },
    { label: "E'lonlar", value: stats?.listings, icon: Building2, tone: "bg-gold-soft text-gold" },
    { label: "Bronlar", value: stats?.bookings, icon: CalendarDays, tone: "bg-[#f4f1ff] text-[#7154c7]" },
  ];

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Boshqaruv paneli</h1>
      <p className="mt-2 text-sm text-muted">Platforma ko&apos;rsatkichlari va boshqaruv.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-lg border border-line bg-white p-5">
              <div className={`grid h-11 w-11 place-items-center rounded-lg ${c.tone}`}>
                <Icon size={21} />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase text-muted">{c.label}</div>
              <div className="mt-1 text-2xl font-bold">{c.value ?? "—"}</div>
            </div>
          );
        })}
      </div>

      {stats && stats.pendingVendors > 0 && (
        <Link
          href={ADMIN_VENDORS}
          className="mt-6 flex items-center justify-between rounded-lg border border-gold/40 bg-gold-soft px-5 py-4 transition hover:bg-[#fdeec8]"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-gold" />
            <div>
              <div className="font-bold text-gold">{stats.pendingVendors} ta biznes tasdiqlash kutmoqda</div>
              <div className="text-xs text-[#9a6b04]">Ko&apos;rib chiqish uchun bosing</div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
