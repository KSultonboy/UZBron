"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  MapPin,
  Phone,
  Search,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface VendorBooking {
  id: string;
  status: string;
  listingTitle: string;
  photo: string | null;
  unitName: string;
  guestName: string;
  guestPhone: string | null;
  startDate: string;
  endDate: string | null;
  guests: number;
  totalPrice: number;
}

const filters = ["Barchasi", "PENDING", "CONFIRMED", "CANCELLED"] as const;

function money(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

export default function PartnerBookingsPage() {
  const [items, setItems] = useState<VendorBooking[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Barchasi");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: VendorBooking[] }>("/vendor/bookings")
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: "CONFIRMED" | "CANCELLED") => {
    setBusyId(id);
    // Optimistik yangilash
    const prev = items;
    setItems((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      await api(`/vendor/bookings/${id}/status`, { method: "PATCH", body: { status } });
    } catch {
      setItems(prev); // xatoda qaytarish
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(
    () =>
      items.filter((item) => {
        const matchesFilter = filter === "Barchasi" || item.status === filter;
        const matchesQuery = `${item.listingTitle} ${item.guestName} ${item.guestPhone ?? ""}`
          .toLocaleLowerCase("uz")
          .includes(query.toLocaleLowerCase("uz"));
        return matchesFilter && matchesQuery;
      }),
    [filter, items, query],
  );

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Bronlar</h1>
        <p className="mt-2 text-sm text-muted">Mehmonlar buyurtmalarini kuzating va boshqaring.</p>
      </div>

      <div className="mt-7 rounded-lg border border-line bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-4 text-sm outline-none focus:border-primary"
              placeholder="Mehmon yoki mehmonxona..."
            />
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:pb-0">
            {filters.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setFilter(item)}
                className={`h-9 shrink-0 rounded-lg px-3 text-xs font-semibold ${
                  filter === item ? "bg-primary text-white" : "bg-canvas text-muted"
                }`}
              >
                {statusLabel(item)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-lg bg-white" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="mt-5 space-y-3">
          {visible.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-line bg-white p-4">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_.9fr_.8fr_auto] lg:items-center">
                <div className="flex min-w-0 gap-3">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    {booking.photo ? (
                      <Image
                        src={booking.photo}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-subtle"><MapPin size={22} /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold">{booking.listingTitle}</h2>
                    <p className="mt-1 truncate text-xs text-muted">{booking.unitName}</p>
                    <div className="mt-2 text-xs font-medium text-primary">#{booking.id.slice(0, 8)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold">{booking.guestName}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <Phone size={13} />
                    {booking.guestPhone ?? "Telefon kiritilmagan"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <UsersRound size={13} />
                    {booking.guests} mehmon
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <CalendarDays size={14} />
                    Kirish
                  </div>
                  <div className="mt-1 text-sm font-bold">{booking.startDate}</div>
                  <div className="mt-1 text-xs text-muted">Chiqish: {booking.endDate ?? "—"}</div>
                </div>
                <div className="flex items-center justify-between gap-4 lg:block lg:text-right">
                  <BookingStatus status={booking.status} />
                  <div className="mt-0 text-sm font-bold lg:mt-3">{money(Number(booking.totalPrice))} so&apos;m</div>
                </div>
              </div>

              {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                  {booking.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(booking.id, "CONFIRMED")}
                      disabled={busyId === booking.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                    >
                      <Check size={15} />
                      Tasdiqlash
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => changeStatus(booking.id, "CANCELLED")}
                    disabled={busyId === booking.id}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3.5 text-xs font-semibold text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
                  >
                    <X size={15} />
                    Bekor qilish
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center">
          <CalendarDays className="mx-auto text-subtle" size={38} />
          <h2 className="mt-4 font-bold">Bronlar topilmadi</h2>
          <p className="mt-2 text-sm text-muted">Tanlangan filtr bo&apos;yicha buyurtma yo&apos;q.</p>
        </div>
      )}
    </div>
  );
}

function BookingStatus({ status }: { status: string }) {
  const Icon = status === "CONFIRMED" ? CircleCheck : status === "CANCELLED" ? XCircle : Clock3;
  const style =
    status === "CONFIRMED"
      ? "bg-[#effaf6] text-success"
      : status === "CANCELLED"
        ? "bg-red-50 text-danger"
        : "bg-gold-soft text-gold";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${style}`}>
      <Icon size={14} />
      {statusLabel(status)}
    </span>
  );
}

function statusLabel(status: string) {
  if (status === "CONFIRMED") return "Tasdiqlangan";
  if (status === "CANCELLED") return "Bekor qilingan";
  if (status === "PENDING") return "Kutilmoqda";
  return status;
}
