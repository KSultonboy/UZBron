"use client";

import { FormEvent, useState } from "react";
import { Building2, CheckCircle2, Lock, Mail, Phone, User } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function VendorApplyForm() {
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inputCls =
    "h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/vendor-apply", {
        method: "POST",
        auth: false,
        body: { businessName, name, email, phone, password },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xato yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-[0_8px_24px_rgba(11,26,61,0.06)]">
        <CheckCircle2 size={44} className="mx-auto text-success" />
        <h3 className="mt-4 text-xl font-bold">Arizangiz qabul qilindi!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          Jamoamiz arizangizni ko&apos;rib chiqadi. Tasdiqlangach, kiritgan email va parolingiz bilan{" "}
          <span className="font-semibold text-ink">Hamkor</span> sifatida kira olasiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_24px_rgba(11,26,61,0.06)] sm:p-7">
      <h3 className="text-xl font-bold">Hamkorlik arizasi</h3>
      <p className="mt-1 text-sm text-muted">Ma&apos;lumotlarni to&apos;ldiring — biz ko&apos;rib chiqamiz.</p>

      <div className="mt-5 space-y-3.5">
        <div className="relative">
          <Building2 size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Biznes nomi (masalan: Hilton Tashkent)" className={inputCls} />
        </div>
        <div className="relative">
          <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mas'ul shaxs ismi" className={inputCls} />
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="relative">
            <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
          </div>
          <div className="relative">
            <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" className={inputCls} />
          </div>
        </div>
        <div className="relative">
          <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol (kamida 6 belgi)" minLength={6} className={inputCls} />
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 h-11 w-full rounded-lg bg-gold text-sm font-bold text-[#1a1206] transition hover:bg-gold-light disabled:opacity-60"
      >
        {busy ? "Yuborilmoqda..." : "Ariza yuborish"}
      </button>
      <p className="mt-2 text-center text-xs text-subtle">Tasdiqlangach, Hamkor sifatida email+parol bilan kirasiz.</p>
    </form>
  );
}
