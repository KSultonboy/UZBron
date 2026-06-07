import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner paneli",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function PartnerRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

