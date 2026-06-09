"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ADMIN_DASHBOARD } from "@/lib/admin-paths";

export function AdminLogin() {
  const router = useRouter();
  const { user, loading, loginWithPassword, verifyEmailCode } = useAuth();

  const [step, setStep] = useState<"login" | "code">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user?.role === "ADMIN") router.replace(ADMIN_DASHBOARD);
  }, [loading, user, router]);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await loginWithPassword(email.trim().toLowerCase(), password);
      if (res.requiresEmailCode) {
        setDevCode(res.devCode);
        if (res.devCode) setCode(res.devCode);
        setStep("code");
      } else {
        router.replace(ADMIN_DASHBOARD);
      }
    } catch {
      setError("Email yoki parol noto'g'ri");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyEmailCode(email.trim().toLowerCase(), code);
      router.replace(ADMIN_DASHBOARD);
    } catch {
      setError("Kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-[0_18px_55px_rgba(11,26,61,0.09)] sm:p-9">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
          <ShieldCheck size={22} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">UZBron Admin</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {step === "login"
            ? "Boshqaruv paneliga kirish uchun hisobingiz ma'lumotlarini kiriting."
            : "Emailingizga yuborilgan tasdiqlash kodini kiriting."}
        </p>

        {step === "login" ? (
          <form onSubmit={submitLogin} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Email</span>
              <div className="mt-2 flex items-center rounded-lg border border-line bg-canvas px-3">
                <Mail size={17} className="text-subtle" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
                  placeholder="admin@uzbron.uz"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Parol</span>
              <div className="mt-2 flex items-center rounded-lg border border-line bg-canvas px-3">
                <Lock size={17} className="text-subtle" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Kirish
            </button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="mt-7 space-y-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-14 w-full rounded-lg border border-line bg-canvas text-center text-2xl font-bold tracking-[10px] outline-none focus:border-primary"
              placeholder="••••••"
              inputMode="numeric"
            />
            {devCode && <p className="text-center text-xs text-subtle">Dev rejimi · kod: {devCode}</p>}
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Tasdiqlash
            </button>
          </form>
        )}

        <p className="mt-7 border-t border-line pt-5 text-xs leading-5 text-subtle">
          Bu sahifa faqat UZBron administratorlari uchun.
        </p>
      </div>
    </main>
  );
}
