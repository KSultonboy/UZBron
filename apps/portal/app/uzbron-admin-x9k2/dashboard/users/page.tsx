"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  bookingsCount: number;
  reviewsCount: number;
  createdAt: string;
}

const ROLE: Record<string, { label: string; cls: string }> = {
  CUSTOMER: { label: "Mijoz", cls: "bg-primary-50 text-primary" },
  VENDOR: { label: "Hamkor", cls: "bg-gold-soft text-gold" },
  ADMIN: { label: "Admin", cls: "bg-[#0b1a3d] text-white" },
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<{ items: AdminUser[] }>("/admin/users")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((u) =>
      [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [items, q]);

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Foydalanuvchilar</h1>
      <p className="mt-2 text-sm text-muted">Ro&apos;yxatdan o&apos;tgan foydalanuvchilar ({items.length}).</p>

      <div className="relative mt-5 max-w-sm">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ism, email yoki telefon..."
          className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16 text-muted"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-subtle">
                <th className="px-4 py-3 font-semibold">Foydalanuvchi</th>
                <th className="px-4 py-3 font-semibold">Aloqa</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Bronlar</th>
                <th className="px-4 py-3 font-semibold">Sharhlar</th>
                <th className="px-4 py-3 font-semibold">Ro&apos;yxatdan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const r = ROLE[u.role] ?? { label: u.role, cls: "bg-canvas text-muted" };
                return (
                  <tr key={u.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 font-semibold">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{u.email ?? u.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${r.cls}`}>{r.label}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.bookingsCount}</td>
                    <td className="px-4 py-3 text-muted">{u.reviewsCount}</td>
                    <td className="px-4 py-3 text-muted">{u.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && <p className="py-16 text-center text-sm text-muted">Foydalanuvchi topilmadi.</p>}
        </div>
      )}
    </div>
  );
}
