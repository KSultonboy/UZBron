import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";
import { Analytics } from "@/components/analytics";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://uzbron.uz";
const DESCRIPTION =
  "O'zbekiston bo'ylab mehmonxona va dam olish maskanlarini toping, solishtiring va ishonchli bron qiling. Toshkentdan Xivagacha — bir necha daqiqada onlayn bron.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UZBron — O'zbekistonda mehmonxona bron qilish",
    template: "%s | UZBron",
  },
  description: DESCRIPTION,
  applicationName: "UZBron",
  keywords: [
    "mehmonxona bron",
    "UZBron",
    "O'zbekiston mehmonxona",
    "Toshkent mehmonxona",
    "Samarqand mehmonxona",
    "Buxoro mehmonxona",
    "Xiva mehmonxona",
    "hotel booking Uzbekistan",
    "onlayn bron",
  ],
  authors: [{ name: "UZBron" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: SITE_URL,
    siteName: "UZBron",
    title: "UZBron — O'zbekistonda mehmonxona bron qilish",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "UZBron — O'zbekistonda mehmonxona bron qilish",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0b1a3d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Analytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
