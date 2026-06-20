"use client";

import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, Coins, Loader2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

interface Reports {
  revenue: number;
  commission: number;
  paidBookings: number;
  last30dBookings: number;
  byStatus: { status: string; count: number }[];
  topListings: { id: string; title: string; city: string; bookings: number; revenue: number }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  CANCELLED: "Bekor qilingan",
  COMPLETED: "Yakunlangan",
};

export default function AdminReportsPage() {
  const [data, setData] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Reports>("/admin/reports")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="grid place-items-center py-24 text-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const cards = [
    { icon: Coins, label: "Umumiy daromad", value: `${data.revenue.toLocaleString("uz-UZ")} so'm`, hint: "Tasdiqlangan + yakunlangan" },
    { icon: TrendingUp, label: "Komissiya (5%)", value: `${data.commission.toLocaleString("uz-UZ")} so'm`, hint: "Platforma ulushi" },
    { icon: CalendarDays, label: "To'langan bronlar", value: data.paidBookings.toLocaleString("uz-UZ"), hint: "Jami" },
    { icon: BarChart3, label: "So'nggi 30 kun", value: data.last30dBookings.toLocaleString("uz-UZ"), hint: "Yangi bronlar" },
  ];

  const maxStatus = Math.max(1, ...data.byStatus.map((s) => s.count));

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Hisobotlar</h1>
      <p className="mt-2 text-sm text-muted">Daromad, komissiya va bron statistikasi.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-white p-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
              <c.icon size={20} />
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
            <div className="text-sm font-medium text-ink">{c.label}</div>
            <div className="text-xs text-subtle">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-bold">Status bo&apos;yicha bronlar</h2>
          <div className="mt-4 space-y-3">
            {data.byStatus.map((s) => (
              <div key={s.status}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{STATUS_LABEL[s.status] ?? s.status}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-canvas">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
              </div>
            ))}
            {!data.byStatus.length && <p className="text-sm text-muted">Ma&apos;lumot yo&apos;q.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-bold">Top mehmonxonalar</h2>
          <div className="mt-4 space-y-3">
            {data.topListings.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-soft text-sm font-bold text-gold">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{t.title}</div>
                  <div className="text-xs text-muted">{t.city} · {t.bookings} bron</div>
                </div>
                <div className="shrink-0 text-sm font-bold">{t.revenue.toLocaleString("uz-UZ")} so&apos;m</div>
              </div>
            ))}
            {!data.topListings.length && <p className="text-sm text-muted">Hozircha bronlar yo&apos;q.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
