"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, LogOut, MapPin, Moon, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  listingTitle: string;
  listingPhoto: string | null;
  city: string;
  unitName: string;
  startDate: string;
  endDate: string | null;
  nights: number;
  guests: number;
  totalPrice: number;
}

const STATUS: Record<Booking["status"], { label: string; cls: string }> = {
  PENDING: { label: "Kutilmoqda", cls: "bg-gold-soft text-gold" },
  CONFIRMED: { label: "Tasdiqlangan", cls: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Bekor qilingan", cls: "bg-red-50 text-red-600" },
  COMPLETED: { label: "Yakunlangan", cls: "bg-primary-50 text-primary" },
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

export function MyBookings() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [items, setItems] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/kirish");
  }, [authLoading, user, router]);

  const load = useCallback(() => {
    api<{ items: Booking[] }>("/bookings")
      .then((d) => setItems(d.items))
      .catch(() => setError("Bronlarni yuklab bo'lmadi. Qayta urinib ko'ring."));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const cancel = async (id: string) => {
    if (!window.confirm("Bronni bekor qilishni tasdiqlaysizmi?")) return;
    setBusyId(id);
    try {
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      load();
    } catch {
      setError("Bekor qilishda xato yuz berdi.");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || !user) {
    return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Yuklanmoqda...</div>;
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Mening bronlarim</h1>
          <p className="mt-1 text-sm text-muted">
            {user.name ?? user.email} — barcha bronlaringiz shu yerda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-danger"
        >
          <LogOut size={16} /> Chiqish
        </button>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {items === null && !error && (
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-line bg-white" />
          ))}
        </div>
      )}

      {items?.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-white py-20 text-center">
          <CalendarDays size={40} className="mx-auto text-subtle" />
          <p className="mt-4 text-lg font-semibold">Hozircha bronlar yo&apos;q</p>
          <p className="mt-1 text-sm text-muted">Mehmonxona tanlang va birinchi broningizni yarating.</p>
          <Link
            href="/mehmonxonalar"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b1a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#13265a]"
          >
            Mehmonxonalarni ko&apos;rish
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-8 space-y-4">
          {items.map((b) => {
            const s = STATUS[b.status];
            const canCancel = b.status === "PENDING" || b.status === "CONFIRMED";
            return (
              <article
                key={b.id}
                className="flex flex-col gap-4 overflow-hidden rounded-xl border border-line bg-white p-4 shadow-[0_8px_24px_rgba(11,26,61,0.05)] sm:flex-row"
              >
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg bg-line sm:h-28 sm:w-40">
                  <Image
                    src={b.listingPhoto ?? FALLBACK_IMG}
                    alt={b.listingTitle}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold">{b.listingTitle}</h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <MapPin size={14} /> {b.city} · {b.unitName}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={15} /> {b.startDate}
                      {b.endDate ? ` — ${b.endDate}` : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Moon size={15} /> {b.nights} kecha
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={15} /> {b.guests} mehmon
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
                    <div className="text-base font-bold">
                      {b.totalPrice.toLocaleString("uz-UZ")} <span className="text-sm font-medium text-muted">so&apos;m</span>
                    </div>
                    {canCancel && (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => cancel(b.id)}
                        className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
                      >
                        {busyId === b.id ? "Bekor qilinmoqda..." : "Bekor qilish"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
