"use client";

import { FormEvent, useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "register";

export function EmailAuthForm({ allowRegister }: { allowRegister: boolean }) {
  const { loginWithPassword, registerWithPassword, verifyEmailCode } = useAuth();
  const [mode, setMode] = useState<Mode>(allowRegister ? "register" : "login");
  const [step, setStep] = useState<"form" | "code">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const inputCls =
    "h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "register") {
        await registerWithPassword(email, password, name);
        // muvaffaqiyat → AuthProvider user'ni o'rnatadi, ota-sahifa yo'naltiradi
      } else {
        const res = await loginWithPassword(email, password);
        if (res.requiresEmailCode) {
          setDevCode(res.devCode ?? null);
          setStep("code");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyEmailCode(email, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod noto'g'ri");
    } finally {
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={onVerify} className="space-y-4">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{email}</span> manziliga yuborilgan 6 xonali kodni kiriting.
        </p>
        {devCode && (
          <p className="rounded-lg bg-gold-soft px-3 py-2 text-xs text-gold">Test kodi: {devCode}</p>
        )}
        <input
          value={code}
          onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="______"
          className="h-12 w-full rounded-lg border border-line bg-canvas text-center text-lg font-bold tracking-[0.4em] text-ink outline-none focus:border-primary focus:bg-white"
        />
        {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="h-11 w-full rounded-lg bg-[#0b1a3d] text-sm font-semibold text-white transition hover:bg-[#13265a] disabled:opacity-50"
        >
          {busy ? "Tekshirilmoqda..." : "Tasdiqlash"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-sm font-medium text-muted transition hover:text-ink"
        >
          Orqaga
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      {mode === "register" && (
        <div className="relative">
          <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ism"
            className={inputCls}
          />
        </div>
      )}
      <div className="relative">
        <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className={inputCls}
        />
      </div>
      <div className="relative">
        <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={6}
          className={inputCls}
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded-lg bg-[#0b1a3d] text-sm font-semibold text-white transition hover:bg-[#13265a] disabled:opacity-50"
      >
        {busy ? "Iltimos kuting..." : mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"}
      </button>

      {allowRegister && (
        <p className="pt-1 text-center text-sm text-muted">
          {mode === "register" ? "Hisobingiz bormi? " : "Hisobingiz yo'qmi? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setError(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "register" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        </p>
      )}
    </form>
  );
}
