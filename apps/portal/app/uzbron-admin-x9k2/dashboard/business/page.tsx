"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Copy, Loader2, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminCreateBusinessPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    try {
      await api("/admin/business", {
        method: "POST",
        body: {
          email,
          password,
          name: form.get("name") || undefined,
          businessName: form.get("businessName") || undefined,
        },
      });
      setCreated({ email, password });
      e.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Xato yuz berdi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Biznes qo&apos;shish</h1>
      <p className="mt-2 text-sm text-muted">
        Yangi biznes/agentlik hisobini yarating. Ular bu email va parol bilan ilovaga kiradi
        (kirishda emailga tasdiqlash kodi yuboriladi).
      </p>

      {created && (
        <div className="mt-6 rounded-lg border border-success/30 bg-[#effaf6] p-5">
          <div className="flex items-center gap-2 font-bold text-success">
            <CheckCircle2 size={20} /> Biznes yaratildi!
          </div>
          <p className="mt-2 text-sm text-[#397a67]">Quyidagi ma&apos;lumotlarni biznesga yetkazing:</p>
          <div className="mt-3 space-y-2 text-sm">
            <CredRow label="Email" value={created.email} />
            <CredRow label="Parol" value={created.password} />
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-lg border border-line bg-white p-5 sm:p-6">
        <Field label="Biznes nomi" name="businessName" placeholder="Masalan, Hilton Tashkent" />
        <Field label="Mas'ul shaxs ismi" name="name" placeholder="Ism Familiya" />
        <Field label="Email" name="email" type="email" required placeholder="biznes@misol.com" />
        <Field label="Parol" name="password" type="text" required placeholder="kamida 6 belgi" />

        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <button
          type="submit"
          disabled={busy}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={17} />}
          Yaratish
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="form-input mt-2" />
    </label>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  const copy = () => navigator.clipboard?.writeText(value);
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
      <span><b>{label}:</b> {value}</span>
      <button type="button" onClick={copy} className="text-muted hover:text-primary" aria-label="Nusxa olish">
        <Copy size={15} />
      </button>
    </div>
  );
}
