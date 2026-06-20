"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api";

type FType = "SUGGESTION" | "COMPLAINT";

export function ContactForm() {
  const [type, setType] = useState<FType>("SUGGESTION");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/feedback", { method: "POST", auth: false, body: { type, name, email, message } });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yuborishda xato yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-line bg-canvas p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-success" />
        <h3 className="mt-3 text-lg font-bold">Murojaatingiz yuborildi!</h3>
        <p className="mt-1 text-sm text-muted">Rahmat — jamoamiz tez orada ko&apos;rib chiqadi.</p>
      </div>
    );
  }

  const types: { key: FType; label: string }[] = [
    { key: "SUGGESTION", label: "Taklif" },
    { key: "COMPLAINT", label: "Shikoyat" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        {types.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              type === t.key ? "bg-[#0b1a3d] text-white" : "border border-line bg-white text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Ism</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ismingiz"
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@misol.uz"
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Xabar</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder={type === "COMPLAINT" ? "Shikoyatingizni batafsil yozing..." : "Taklif yoki savolingizni yozing..."}
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0b1a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#13265a] disabled:opacity-60"
      >
        <Send size={17} /> {busy ? "Yuborilmoqda..." : "Yuborish"}
      </button>
    </form>
  );
}
