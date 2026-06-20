"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, CalendarCheck, ChartNoAxesCombined, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { GOOGLE_CLIENT_ID } from "@/lib/config";
import { PARTNER_DASHBOARD } from "@/lib/portal-paths";
import { EmailAuthForm } from "@/components/email-auth-form";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}

const portalBenefits = [
  { icon: Building2, text: "Mehmonxonalar va xonalarni boshqarish" },
  { icon: CalendarCheck, text: "Kelgan bronlarni real vaqtda kuzatish" },
  { icon: ChartNoAxesCombined, text: "Asosiy biznes ko'rsatkichlarini ko'rish" },
];

export function PartnerLogin() {
  const router = useRouter();
  const { user, loading, loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(PARTNER_DASHBOARD);
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
            await loginWithGoogle(credential);
            router.replace(PARTNER_DASHBOARD);
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
      <section
        className="relative hidden min-h-screen overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14"
      >
        <Image
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=90"
          alt=""
          fill
          priority
          sizes="54vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a3d]/96 via-[#0b1a3d]/88 to-[#0b1a3d]/72" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1a3d] to-transparent" />
        <div className="relative text-xl font-bold">
          UZ<span className="text-gold-light">Bron</span>
          <span className="ml-2 text-sm font-medium text-white/65">Partner</span>
        </div>
        <div className="relative max-w-xl" style={{ textShadow: "0 2px 16px rgba(3,7,18,0.45)" }}>
          <p className="text-sm font-semibold text-gold-light">Biznes boshqaruvi</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight xl:text-5xl">
            Mehmonxonangizni bitta paneldan boshqaring
          </h1>
          <p className="mt-5 max-w-lg leading-7 text-white/85">
            E&apos;lonlar, xonalar, narxlar va bronlar uchun tez, tushunarli va xavfsiz ish maydoni.
          </p>
          <div className="mt-9 grid gap-4">
            {portalBenefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/12">
                  <Icon size={18} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/45">© 2026 UZBron Partner</div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
        <div className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-[0_18px_55px_rgba(11,26,61,0.09)] sm:p-9">
          <div className="mb-8 lg:hidden">
            <div className="text-xl font-bold text-primary">
              UZ<span className="text-gold">Bron</span>
              <span className="ml-2 text-sm font-medium text-muted">Partner</span>
            </div>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary">
            <ShieldCheck size={22} />
          </div>
          <h2 className="mt-5 text-2xl font-bold">Partner paneliga kirish</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tasdiqlangan agentlik yoki biznes hisobingiz bilan davom eting.
          </p>

          <div className="mt-6">
            <EmailAuthForm allowRegister={false} />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs font-medium text-subtle">
            <span className="h-px flex-1 bg-line" /> yoki <span className="h-px flex-1 bg-line" />
          </div>

          <div className="min-h-11">
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
            Ushbu sahifa faqat UZBron hamkorlari uchun. Kirish orqali platforma shartlariga rozilik bildirasiz.
          </p>
        </div>
      </section>
    </main>
  );
}
