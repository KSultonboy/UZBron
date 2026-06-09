"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BedDouble, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PARTNER_LISTINGS } from "@/lib/portal-paths";

interface Unit {
  id: string;
  name: string;
  basePrice: number;
  capacity: number;
  beds: string;
  size: string;
}

function money(v: number) {
  return new Intl.NumberFormat("uz-UZ").format(v);
}

export default function RoomsPage() {
  const params = useParams<{ id: string }>();
  const listingId = params.id;
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Unit | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api<{ listingTitle: string; items: Unit[] }>(`/vendor/listings/${listingId}/units`)
      .then((d) => {
        setTitle(d.listingTitle);
        setUnits(d.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (listingId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const remove = async (u: Unit) => {
    if (!window.confirm(`"${u.name}" xonasi o'chiriladi. Davom etasizmi?`)) return;
    setBusy(true);
    try {
      await api(`/vendor/units/${u.id}`, { method: "DELETE" });
      setUnits((list) => list.filter((x) => x.id !== u.id));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "O'chirishda xato");
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"),
      basePrice: Number(f.get("basePrice")),
      capacity: Number(f.get("capacity")),
      beds: f.get("beds") || undefined,
      size: f.get("size") || undefined,
    };
    try {
      if (editing === "new") {
        await api(`/vendor/listings/${listingId}/units`, { method: "POST", body });
      } else if (editing) {
        await api(`/vendor/units/${editing.id}`, { method: "PATCH", body });
      }
      setEditing(null);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Saqlashda xato");
    } finally {
      setBusy(false);
    }
  };

  const current = editing === "new" ? undefined : editing ?? undefined;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <Link href={`${PARTNER_LISTINGS}/${listingId}/edit`} className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={17} /> E&apos;longa qaytish
      </Link>
      <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Xonalar</h1>
          <p className="mt-2 text-sm text-muted">{title}</p>
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} /> Xona qo&apos;shish
          </button>
        )}
      </div>

      {editing !== null && (
        <form onSubmit={save} className="mt-6 rounded-lg border border-line bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">{editing === "new" ? "Yangi xona" : "Xonani tahrirlash"}</h2>
            <button type="button" onClick={() => setEditing(null)} className="text-muted hover:text-ink"><X size={18} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <L label="Xona nomi" req><input name="name" required defaultValue={current?.name} className="form-input" placeholder="Lyuks xona" /></L>
            <L label="Sig'imi (kishi)" req><input name="capacity" type="number" min="1" required defaultValue={current?.capacity ?? 2} className="form-input" /></L>
            <L label="Narxi (so'm)" req><input name="basePrice" type="number" min="0" required defaultValue={current?.basePrice} className="form-input" placeholder="850000" /></L>
            <L label="Krovat"><input name="beds" defaultValue={current?.beds} className="form-input" placeholder="1 katta krovat" /></L>
            <L label="Maydoni"><input name="size" defaultValue={current?.size} className="form-input" placeholder="24 m²" /></L>
          </div>
          <button type="submit" disabled={busy} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Saqlash
          </button>
        </form>
      )}

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {units.map((u) => (
            <div key={u.id} className="flex items-center gap-4 rounded-lg border border-line bg-white p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary"><BedDouble size={20} /></div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{u.name}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {money(u.basePrice)} so&apos;m · {u.capacity} kishi{u.beds ? ` · ${u.beds}` : ""}{u.size ? ` · ${u.size}` : ""}
                </div>
              </div>
              <button type="button" onClick={() => setEditing(u)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-primary" aria-label="Tahrirlash"><Pencil size={15} /></button>
              <button type="button" onClick={() => remove(u)} disabled={busy} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-danger hover:text-danger disabled:opacity-50" aria-label="O'chirish"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function L({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label} {req && <span className="text-danger">*</span>}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
