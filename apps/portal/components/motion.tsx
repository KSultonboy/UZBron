"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Ease-out-expo — premium, no bounce.
export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Observer + fallback timer. Element ko'rinishga kirsa — ochiladi.
 * Agar observer ishlamasa (headless renderer, SEO crawler, eski brauzer),
 * 2.5s dan keyin baribir ko'rsatiladi — bo'lim hech qachon bo'sh qolmaydi.
 */
function useReveal(margin = "-80px") {
  const ref = useRef<HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inView = useInView(ref, { once: true, margin: margin as any });
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    if (inView) return;
    const t = setTimeout(() => setFallback(true), 2500);
    return () => clearTimeout(t);
  }, [inView]);
  return { ref, shown: inView || fallback };
}

/** Scroll-reveal: fade + slide-up. Reduced-motion'da faqat fade. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reduce = useReducedMotion();
  const { ref, shown } = useReveal();
  const Comp = motion[as];
  return (
    <Comp
      ref={ref as never}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Bolalarni ketma-ket (stagger) ochadigan konteyner. */
export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const { ref, shown } = useReveal("-60px");
  return (
    <motion.div
      ref={ref as never}
      className={className}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Ko'rinishga kirganda 0'dan `to`'gacha sanaydigan raqam (fallback bilan). */
export function CountUp({
  to,
  suffix = "",
  className,
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduce) {
      setVal(to);
      return;
    }
    // Fallback: observer ishlamasa ham 2.5s dan keyin to'liq sonni ko'rsat
    const fallback = setTimeout(() => setVal(to), 2500);
    if (!inView) return () => clearTimeout(fallback);
    clearTimeout(fallback);
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("uz-UZ")}
      {suffix}
    </span>
  );
}
