import type { ReactNode } from "react";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export function LegalDoc({ updated, children }: { updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
      <p className="text-sm text-subtle">Oxirgi yangilanish: {updated}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
