"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface VendorMe {
  id: string;
  name: string;
  status: string;
  listingsCount: number;
}
interface VendorBooking {
  id: string;
  totalPrice: number;
  status: string;
}

export default function DashboardPage() {
  const [me, setMe] = useState<VendorMe | null>(null);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<VendorMe>("/vendor/me"),
      api<{ items: VendorBooking[] }>("/vendor/bookings"),
    ])
      .then(([m, b]) => {
        setMe(m);
        setBookings(b.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-ink">Boshqaruv paneli</h1>
      <p className="mt-1 text-muted">{me?.name ?? "Hamkor"} — xush kelibsiz!</p>

      {loading ? (
        <div className="mt-8 text-muted">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Mehmonxonalar" value={me?.listingsCount ?? 0} icon="🏨" />
            <Stat label="Bronlar" value={bookings.length} icon="📅" />
            <Stat label="Daromad (so'm)" value={revenue.toLocaleString("ru-RU")} icon="💰" />
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Tezkor boshlash</h2>
              <Link
                href="/dashboard/listings/new"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                + Mehmonxona qo'shish
              </Link>
            </div>
            <p className="mt-2 text-sm text-muted">
              Mehmonxonangizni qo'shing, xonalar va narxlarni belgilang, rasm yuklang — mijozlar uni ilovada ko'radi.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}
