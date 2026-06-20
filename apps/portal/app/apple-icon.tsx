import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 9c-10.5 0-19 8.1-19 18.1 0 12.4 16.4 25.3 18.2 26.7a1.3 1.3 0 0 0 1.6 0C34.6 52.4 51 39.5 51 27.1 51 17.1 42.5 9 32 9Z" fill="#EAB308"/><path d="M32 17.5l2.9 7.6L42.5 28l-7.6 2.9L32 38.5l-2.9-7.6L21.5 28l7.6-2.9Z" fill="#0B1A3D"/></svg>`,
  );

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0B1A3D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK} width={132} height={132} alt="" />
      </div>
    ),
    { ...size },
  );
}
