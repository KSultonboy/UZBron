"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Lightbulb, RotateCcw, TriangleAlert } from "lucide-react";
import { api } from "@/lib/api";

interface Feedback {
  id: string;
  type: "COMPLAINT" | "SUGGESTION";
  name: string | null;
  email: string | null;
  message: string;
  status: "NEW" | "RESOLVED";
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"ALL" | "COMPLAINT" | "SUGGESTION">("ALL");

  useEffect(() => {
    api<{ items: Feedback[] }>("/admin/feedback")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (id: string, status: "NEW" | "RESOLVED") => {
    setBusyId(id);
    const prev = items;
    setItems((l) => l.map((f) => (f.id === id ? { ...f, status } : f)));
    try {
      await api(`/admin/feedback/${id}/status`, { method: "PATCH", body: { status } });
    } catch {
      setItems(prev);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(
    () => (tab === "ALL" ? items : items.filter((f) => f.type === tab)),
    [items, tab],
  );
  const newCount = items.filter((f) => f.status === "NEW").length;

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "ALL", label: `Hammasi (${items.length})` },
    { key: "COMPLAINT", label: "Shikoyatlar" },
    { key: "SUGGESTION", label: "Takliflar" },
  ];

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Shikoyat va takliflar</h1>
      <p className="mt-2 text-sm text-muted">
        Foydalanuvchi murojaatlari. {newCount > 0 && <span className="font-semibold text-gold">{newCount} ta yangi</span>}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t.key ? "bg-[#0b1a3d] text-white" : "border border-line bg-white text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((f) => {
            const isComplaint = f.type === "COMPLAINT";
            const resolved = f.status === "RESOLVED";
            return (
              <article key={f.id} className={`rounded-lg border bg-white p-4 ${resolved ? "border-line opacity-70" : "border-line"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isComplaint ? "bg-red-50 text-danger" : "bg-gold-soft text-gold"}`}>
                      {isComplaint ? <TriangleAlert size={18} /> : <Lightbulb size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-subtle">
                          {isComplaint ? "Shikoyat" : "Taklif"}
                        </span>
                        {resolved && <span className="rounded-full bg-[#effaf6] px-2 py-0.5 text-[10px] font-bold text-success">Hal qilingan</span>}
                      </div>
                      <p className="mt-1 text-sm text-ink">{f.message}</p>
                      <div className="mt-1.5 text-xs text-muted">
                        {f.name ?? "Anonim"} {f.email ? `· ${f.email}` : ""} · {f.createdAt}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus(f.id, resolved ? "NEW" : "RESOLVED")}
                    disabled={busyId === f.id}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-50 ${
                      resolved
                        ? "border border-line text-muted hover:text-ink"
                        : "bg-primary text-white"
                    }`}
                  >
                    {resolved ? <><RotateCcw size={15} /> Qayta ochish</> : <><Check size={15} /> Hal qilindi</>}
                  </button>
                </div>
              </article>
            );
          })}
          {!filtered.length && <p className="py-16 text-center text-sm text-muted">Murojaatlar yo&apos;q.</p>}
        </div>
      )}
    </div>
  );
}
