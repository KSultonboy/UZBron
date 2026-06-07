import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "UZBron — O'zbekistonda mehmonxona bron qilish",
    template: "%s | UZBron",
  },
  description:
    "O'zbekiston bo'ylab mehmonxona va dam olish maskanlarini toping, solishtiring va ishonchli bron qiling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
