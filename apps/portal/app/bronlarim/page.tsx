import type { Metadata } from "next";
import { SitePage } from "@/components/site-page";
import { MyBookings } from "@/components/my-bookings";

export const metadata: Metadata = {
  title: "Mening bronlarim",
  description: "UZBron bronlaringizni ko'ring va boshqaring.",
};

export default function BronlarimPage() {
  return (
    <SitePage>
      <MyBookings />
    </SitePage>
  );
}
