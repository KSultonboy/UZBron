"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { GOOGLE_CLIENT_ID } from "@/lib/config";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, loginWithGoogle } = useAuth();
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || user) return;
    const tryInit = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: { credential: string }) => {
          try {
            await loginWithGoogle(resp.credential);
            router.replace("/dashboard");
          } catch {
            setError("Kirishda xato. Qayta urinib ko'ring.");
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 320,
        locale: "uz",
      });
      return true;
    };
    if (!tryInit()) {
      const t = setInterval(() => tryInit() && clearInterval(t), 200);
      return () => clearInterval(t);
    }
  }, [loading, user, loginWithGoogle, router]);

  return (
    <main className="flex min-h-screen">
      {/* Chap — brend paneli */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-dark to-primary p-12 text-white lg:flex">
        <div className="text-2xl font-bold">UZBron <span className="font-medium text-gold-light">Biznes</span></div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Mehmonxonangizni{"\n"}minglab mijozlarga yeting</h1>
          <p className="mt-4 max-w-md text-white/80">
            Hamkorlar portali orqali mehmonxona ma'lumotlarini joylang, narx va xonalarni boshqaring, kelgan bronlarni real vaqtda kuzating.
          </p>
          <ul className="mt-8 space-y-3 text-white/90">
            <li>✓ Cheksiz e'lon va xona qo'shish</li>
            <li>✓ Rasm yuklash va tahrirlash</li>
            <li>✓ Bronlarni bir joyda boshqarish</li>
          </ul>
        </div>
        <div className="text-sm text-white/60">© 2026 UZBron</div>
      </div>

      {/* O'ng — kirish */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-2 text-2xl font-bold text-primary lg:hidden">UZBron Biznes</div>
          <h2 className="text-2xl font-bold text-ink">Hamkorlar portaliga kirish</h2>
          <p className="mt-2 text-muted">Davom etish uchun Google hisobingiz bilan kiring</p>

          <div className="mt-8 flex justify-center">
            {loading ? (
              <div className="text-muted">Yuklanmoqda...</div>
            ) : (
              <div ref={btnRef} />
            )}
          </div>

          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

          <p className="mt-8 text-center text-xs text-muted">
            Kirish orqali siz Foydalanish shartlariga rozilik bildirasiz
          </p>
        </div>
      </div>
    </main>
  );
}
