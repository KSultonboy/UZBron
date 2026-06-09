"use client";

import { useEffect, useState } from "react";
import { Ban, Check, Clock, Loader2, Store } from "lucide-react";
import { api } from "@/lib/api";

interface Vendor {
  id: string;
  name: string;
  status: string;
  email: string | null;
  phone: string | null;
  ownerName: string | null;
  listingsCount: number;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const [items, setItems] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: Vendor[] }>("/admin/vendors")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (id: string, status: "APPROVED" | "PENDING" | "BLOCKED") => {
    setBusyId(id);
    const prev = items;
    setItems((l) => l.map((v) => (v.id === id ? { ...v, status } : v)));
    try {
      await api(`/admin/vendors/${id}/status`, { method: "PATCH", body: { status } });
    } catch {
      setItems(prev);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Bizneslar</h1>
      <p className="mt-2 text-sm text-muted">Biznes hisoblarini tasdiqlang yoki bloklang.</p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((v) => (
            <article key={v.id} className="rounded-lg border border-line bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
                    <Store size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-bold">{v.name}</h2>
                      <StatusBadge status={v.status} />
                    </div>
                    <div className="mt-1 truncate text-xs text-muted">
                      {v.email ?? v.phone ?? "—"} · {v.listingsCount} e&apos;lon · {v.createdAt}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {v.status !== "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => setStatus(v.id, "APPROVED")}
                      disabled={busyId === v.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <Check size={15} /> Tasdiqlash
                    </button>
                  )}
                  {v.status !== "BLOCKED" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(v.id, "BLOCKED")}
                      disabled={busyId === v.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3.5 text-xs font-semibold text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
                    >
                      <Ban size={15} /> Bloklash
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStatus(v.id, "PENDING")}
                      disabled={busyId === v.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3.5 text-xs font-semibold text-muted disabled:opacity-50"
                    >
                      Blokdan chiqarish
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!items.length && <p className="py-16 text-center text-sm text-muted">Bizneslar yo&apos;q.</p>}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const ok = status === "APPROVED";
  const blocked = status === "BLOCKED";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
        ok ? "bg-[#effaf6] text-success" : blocked ? "bg-red-50 text-danger" : "bg-gold-soft text-gold"
      }`}
    >
      {ok ? <Check size={11} /> : blocked ? <Ban size={11} /> : <Clock size={11} />}
      {ok ? "Tasdiqlangan" : blocked ? "Bloklangan" : "Kutilmoqda"}
    </span>
  );
}
