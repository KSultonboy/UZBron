"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Loader2, MapPin, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface AdminListing {
  id: string;
  title: string;
  city: string;
  status: string;
  photo: string | null;
  vendorName: string;
  bookingsCount: number;
  createdAt: string;
}

export default function AdminListingsPage() {
  const [items, setItems] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: AdminListing[] }>("/admin/listings")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (item: AdminListing) => {
    if (!window.confirm(`"${item.title}" e'loni butunlay o'chiriladi. Davom etasizmi?`)) return;
    setBusyId(item.id);
    try {
      await api(`/admin/listings/${item.id}`, { method: "DELETE" });
      setItems((l) => l.filter((x) => x.id !== item.id));
    } catch {
      window.alert("O'chirishda xato.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">E&apos;lonlar</h1>
      <p className="mt-2 text-sm text-muted">Barcha e&apos;lonlarni ko&apos;ring va moderatsiya qiling.</p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="flex gap-4 p-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  {item.photo ? (
                    <Image src={item.photo} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-subtle"><Building2 size={24} /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold">{item.title}</h2>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <MapPin size={13} /> {item.city}
                  </div>
                  <div className="mt-1 truncate text-xs text-subtle">{item.vendorName} · {item.bookingsCount} bron</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(item)}
                disabled={busyId === item.id}
                className="flex w-full items-center justify-center gap-2 border-t border-line py-3 text-xs font-semibold text-muted transition hover:bg-red-50 hover:text-danger disabled:opacity-50"
              >
                {busyId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                O&apos;chirish
              </button>
            </article>
          ))}
          {!items.length && <p className="py-16 text-center text-sm text-muted">E&apos;lonlar yo&apos;q.</p>}
        </div>
      )}
    </div>
  );
}
