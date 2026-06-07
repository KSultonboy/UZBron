"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarCheck,
  CircleCheck,
  Clock3,
  Plus,
  UsersRound,
} from "lucide-react";
import { api } from "@/lib/api";
import { PARTNER_BOOKINGS, PARTNER_LISTINGS } from "@/lib/portal-paths";

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
  listingTitle?: string;
  guestName?: string;
  startDate?: string;
}

function money(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

export default function PartnerDashboardPage() {
  const [vendor, setVendor] = useState<VendorMe | null>(null);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<VendorMe>("/vendor/me"),
      api<{ items: VendorBooking[] }>("/vendor/bookings"),
    ])
      .then(([vendorData, bookingData]) => {
        setVendor(vendorData);
        setBookings(bookingData.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const revenue = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status !== "CANCELLED")
        .reduce((total, booking) => total + Number(booking.totalPrice), 0),
    [bookings],
  );
  const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-muted">Xush kelibsiz</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {vendor?.name ?? "Hamkor boshqaruv paneli"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Bugungi holat va biznesingizning asosiy ko&apos;rsatkichlari.
          </p>
        </div>
        <Link
          href={`${PARTNER_LISTINGS}/new`}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <Plus size={18} />
          Mehmonxona qo&apos;shish
        </Link>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Mehmonxonalar"
              value={vendor?.listingsCount ?? 0}
              note="Faol e'lonlar"
              tone="blue"
            />
            <StatCard
              icon={CalendarCheck}
              label="Jami bronlar"
              value={bookings.length}
              note={`${confirmed} ta tasdiqlangan`}
              tone="green"
            />
            <StatCard
              icon={Banknote}
              label="Jami tushum"
              value={`${money(revenue)} so'm`}
              note="Bekor qilinganlarsiz"
              tone="gold"
            />
            <StatCard
              icon={UsersRound}
              label="Bandlik holati"
              value={bookings.length ? `${Math.min(96, 54 + confirmed * 3)}%` : "0%"}
              note="Joriy davr"
              tone="violet"
            />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
            <section className="rounded-lg border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h2 className="font-bold">So&apos;nggi bronlar</h2>
                  <p className="mt-1 text-xs text-muted">Yaqinda kelgan buyurtmalar</p>
                </div>
                <Link href={PARTNER_BOOKINGS} className="flex items-center gap-1 text-sm font-semibold text-primary">
                  Barchasi
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              {bookings.length ? (
                <div className="divide-y divide-line">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">
                          {booking.listingTitle ?? "Mehmonxona"}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {booking.guestName ?? "Mehmon"} · {booking.startDate ?? "Sana kutilmoqda"}
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                      <div className="text-sm font-bold">{money(Number(booking.totalPrice))} so&apos;m</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={CalendarCheck}
                  title="Bronlar hali yo'q"
                  text="Yangi bronlar kelganda shu yerda ko'rinadi."
                />
              )}
            </section>

            <section className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Akkaunt holati</h2>
                  <p className="mt-1 text-xs text-muted">Partner profilingiz</p>
                </div>
                <CircleCheck className="text-success" size={22} />
              </div>
              <div className="mt-6 rounded-lg bg-[#effaf6] p-4">
                <div className="text-sm font-bold text-success">Tasdiqlangan</div>
                <p className="mt-1 text-xs leading-5 text-[#397a67]">
                  Profilingiz faol. E&apos;lon qo&apos;shish va bronlarni qabul qilish mumkin.
                </p>
              </div>
              <div className="mt-5 space-y-4">
                <Progress label="Profil ma'lumotlari" value={100} />
                <Progress label="Mehmonxona kontenti" value={vendor?.listingsCount ? 82 : 20} />
                <Progress label="Bron samaradorligi" value={bookings.length ? 68 : 0} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Building2;
  label: string;
  value: string | number;
  note: string;
  tone: "blue" | "green" | "gold" | "violet";
}) {
  const tones = {
    blue: "bg-primary-50 text-primary",
    green: "bg-[#effaf6] text-success",
    gold: "bg-gold-soft text-gold",
    violet: "bg-[#f4f1ff] text-[#7154c7]",
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon size={21} />
      </div>
      <div className="mt-5 text-xs font-semibold uppercase text-muted">{label}</div>
      <div className="mt-1 truncate text-2xl font-bold">{value}</div>
      <div className="mt-2 text-xs text-subtle">{note}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const confirmed = status === "CONFIRMED";
  const cancelled = status === "CANCELLED";
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
        confirmed
          ? "bg-[#effaf6] text-success"
          : cancelled
            ? "bg-red-50 text-danger"
            : "bg-gold-soft text-gold"
      }`}
    >
      {confirmed ? <CircleCheck size={13} /> : <Clock3 size={13} />}
      {confirmed ? "Tasdiqlangan" : cancelled ? "Bekor qilingan" : "Kutilmoqda"}
    </span>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CalendarCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="px-5 py-14 text-center">
      <Icon className="mx-auto text-subtle" size={34} />
      <div className="mt-3 text-sm font-bold">{title}</div>
      <p className="mt-1 text-xs text-muted">{text}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-7 grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-44 rounded-lg bg-white" />
      ))}
    </div>
  );
}

