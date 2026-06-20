import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** Inner-sahifa qobig'i: header + kontent + footer. */
export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Navy gradient banner — inner-sahifa sarlavhasi. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0b1a3d] text-white">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(234,179,8,0.20), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(30,58,138,0.55), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8">
        {eyebrow && (
          <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-light">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">{subtitle}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
