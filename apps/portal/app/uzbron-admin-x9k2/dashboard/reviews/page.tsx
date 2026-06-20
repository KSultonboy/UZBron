"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface Review {
  id: string;
  listingTitle: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: Review[] }>("/admin/reviews")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("Bu sharhni o'chirasizmi?")) return;
    setBusyId(id);
    const prev = items;
    setItems((l) => l.filter((r) => r.id !== id));
    try {
      await api(`/admin/reviews/${id}`, { method: "DELETE" });
    } catch {
      setItems(prev);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Sharhlar</h1>
      <p className="mt-2 text-sm text-muted">Foydalanuvchi sharhlarini ko&apos;ring va nomaqbullarini o&apos;chiring.</p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((r) => (
            <article key={r.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{r.author}</span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-star">
                      <Star size={13} className="fill-star text-star" /> {r.rating}
                    </span>
                  </div>
                  <div className="text-xs text-muted">{r.listingTitle} · {r.createdAt}</div>
                  {r.comment && <p className="mt-2 text-sm text-ink">{r.comment}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  disabled={busyId === r.id}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
                >
                  <Trash2 size={15} /> O&apos;chirish
                </button>
              </div>
            </article>
          ))}
          {!items.length && <p className="py-16 text-center text-sm text-muted">Sharhlar yo&apos;q.</p>}
        </div>
      )}
    </div>
  );
}
