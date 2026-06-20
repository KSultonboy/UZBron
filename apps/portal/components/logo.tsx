import type { CSSProperties } from "react";

/** UZBron logo belgisi (faqat ikonka). */
export function LogoMark({ size = 28, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} style={style} aria-hidden focusable="false">
      <rect width="64" height="64" rx="15" fill="#0B1A3D" />
      <path
        d="M32 9c-10.5 0-19 8.1-19 18.1 0 12.4 16.4 25.3 18.2 26.7a1.3 1.3 0 0 0 1.6 0C34.6 52.4 51 39.5 51 27.1 51 17.1 42.5 9 32 9Z"
        fill="#EAB308"
      />
      <path d="M32 17.5l2.9 7.6L42.5 28l-7.6 2.9L32 38.5l-2.9-7.6L21.5 28l7.6-2.9Z" fill="#0B1A3D" />
    </svg>
  );
}

/** Ikonka + "UZBron" so'z belgisi. */
export function Logo({
  size = 26,
  className = "",
  uzClass = "",
  bronClass = "text-gold",
}: {
  size?: number;
  className?: string;
  uzClass?: string;
  bronClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${className}`}>
      <LogoMark size={size} />
      <span>
        <span className={uzClass}>UZ</span>
        <span className={bronClass}>Bron</span>
      </span>
    </span>
  );
}
