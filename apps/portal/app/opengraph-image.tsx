import { ImageResponse } from "next/og";

export const alt = "UZBron — O'zbekiston bo'ylab mehmonxona bron qilish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#0B1A3D"/><path d="M32 9c-10.5 0-19 8.1-19 18.1 0 12.4 16.4 25.3 18.2 26.7a1.3 1.3 0 0 0 1.6 0C34.6 52.4 51 39.5 51 27.1 51 17.1 42.5 9 32 9Z" fill="#EAB308"/><path d="M32 17.5l2.9 7.6L42.5 28l-7.6 2.9L32 38.5l-2.9-7.6L21.5 28l7.6-2.9Z" fill="#0B1A3D"/></svg>`,
  );

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B1A3D 0%, #13265A 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK} width={120} height={120} alt="" />
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#fff" }}>
            <span>UZ</span>
            <span style={{ color: "#FACC15" }}>Bron</span>
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 46, fontWeight: 700, color: "#fff", maxWidth: 900, lineHeight: 1.25 }}>
          O&apos;zbekiston bo&apos;ylab mehmonxona bron qilish
        </div>
        <div style={{ marginTop: 20, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>
          Qidiring · Taqqoslang · Bir necha daqiqada bron qiling
        </div>
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234,179,8,0.30), transparent 70%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
