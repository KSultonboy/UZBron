"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { GOOGLE_CLIENT_ID } from "@/lib/config";
import { PARTNER_DASHBOARD } from "@/lib/portal-paths";

const CUSTOMER_HOME = "/bronlarim";

function destForRole(role: string) {
  return role === "VENDOR" || role === "ADMIN" ? PARTNER_DASHBOARD : CUSTOMER_HOME;
}

const benefits = [
  { icon: CalendarCheck, text: "Barcha bronlaringizni bir joyda ko'ring" },
  { icon: Heart, text: "Yoqtirgan mehmonxonalaringizni saqlang" },
  { icon: Sparkles, text: "Tez, qulay va xavfsiz kirish" },
];

export function UserLogin() {
  const router = useRouter();
  const { user, loading, loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(destForRole(user.role));
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || user) return;

    const initialize = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            setError(null);
            const u = await loginWithGoogle(credential);
            router.replace(destForRole(u.role));
          } catch {
            setError("Kirishda xato yuz berdi. Qayta urinib ko'ring.");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: Math.min(340, buttonRef.current.clientWidth || 340),
        locale: "uz",
      });
      return true;
    };

    if (initialize()) return;
    const timer = window.setInterval(() => {
      if (initialize()) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [loading, user, loginWithGoogle, router]);

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=90"
          alt=""
          fill
          priority
          sizes="54vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a3d]/96 via-[#0b1a3d]/88 to-[#0b1a3d]/72" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1a3d] to-transparent" />
        <Link href="/" className="relative text-xl font-bold">
          UZ<span className="text-gold-light">Bron</span>
        </Link>
        <div className="relative max-w-xl" style={{ textShadow: "0 2px 16px rgba(3,7,18,0.45)" }}>
          <p className="text-sm font-semibold text-gold-light">Xush kelibsiz</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight xl:text-5xl">
            Sayohatlaringizni bitta hisobda boshqaring
          </h1>
          <p className="mt-5 max-w-lg leading-7 text-white/85">
            Bron qiling, kuzating va sevimlilaringizni saqlang — barchasi UZBron hisobingizda.
          </p>
          <div className="mt-9 grid gap-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/12">
                  <Icon size={18} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/45">© 2026 UZBron</div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
        <div className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-[0_18px_55px_rgba(11,26,61,0.09)] sm:p-9">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-xl font-bold text-primary">
              UZ<span className="text-gold">Bron</span>
            </Link>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
            <ShieldCheck size={22} />
          </div>
          <h2 className="mt-5 text-2xl font-bold">Hisobingizga kirish</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Bronlaringizni ko&apos;rish uchun Google orqali davom eting.
          </p>

          <div className="mt-8 min-h-11">
            {loading ? (
              <div className="h-11 animate-pulse rounded-lg bg-canvas" />
            ) : (
              <div ref={buttonRef} className="flex w-full justify-center overflow-hidden" />
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <p className="mt-8 border-t border-line pt-5 text-xs leading-5 text-subtle">
            Hamkor yoki agentlik hisobi bilan kirsangiz, avtomatik biznes paneliga yo&apos;naltirilasiz. Kirish orqali{" "}
            <Link href="/shartlar" className="text-primary underline">
              shartlar
            </Link>{" "}
            va{" "}
            <Link href="/maxfiylik" className="text-primary underline">
              maxfiylik siyosati
            </Link>
            ga rozilik bildirasiz.
          </p>
        </div>
      </section>
    </main>
  );
}
