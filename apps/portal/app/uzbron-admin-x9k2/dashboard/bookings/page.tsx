"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Booking {
  id: string;
  status: string;
  listingTitle: string;
  city: string | null;
  unitName: string;
  customer: string;
  startDate: string;
  endDate: string | null;
  guests: number;
  totalPrice: number;
  createdAt: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Kutilmoqda", cls: "bg-gold-soft text-gold" },
  CONFIRMED: { label: "Tasdiqlangan", cls: "bg-[#effaf6] text-success" },
  CANCELLED: { label: "Bekor", cls: "bg-red-50 text-danger" },
  COMPLETED: { label: "Yakunlangan", cls: "bg-primary-50 text-primary" },
};

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: Booking[] }>("/admin/bookings")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Bronlar</h1>
      <p className="mt-2 text-sm text-muted">Platformadagi barcha bronlar ({items.length}).</p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-subtle">
                <th className="px-4 py-3 font-semibold">Mehmonxona</th>
                <th className="px-4 py-3 font-semibold">Mijoz</th>
                <th className="px-4 py-3 font-semibold">Sanalar</th>
                <th className="px-4 py-3 font-semibold">Mehmon</th>
                <th className="px-4 py-3 font-semibold">Summa</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const s = STATUS[b.status] ?? { label: b.status, cls: "bg-canvas text-muted" };
                return (
                  <tr key={b.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{b.listingTitle}</div>
                      <div className="text-xs text-muted">{b.city} · {b.unitName}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{b.customer}</td>
                    <td className="px-4 py-3 text-muted">{b.startDate}{b.endDate ? ` → ${b.endDate}` : ""}</td>
                    <td className="px-4 py-3 text-muted">{b.guests}</td>
                    <td className="px-4 py-3 font-semibold">{b.totalPrice.toLocaleString("uz-UZ")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!items.length && <p className="py-16 text-center text-sm text-muted">Bronlar yo&apos;q.</p>}
        </div>
      )}
    </div>
  );
}
