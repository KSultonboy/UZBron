import type { Metadata } from "next";
import { SitePage, PageHero } from "@/components/site-page";
import { HotelsBrowser } from "@/components/hotels-browser";

export const metadata: Metadata = {
  title: "Mehmonxonalar",
  description: "O'zbekiston bo'ylab mehmonxonalarni qidiring, taqqoslang va onlayn bron qiling.",
};

export default function MehmonxonalarPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Katalog"
        title="O'zbekiston bo'ylab mehmonxonalar"
        subtitle="Toshkentdan Xivagacha — tekshirilgan mehmonxonalarni qidiring, narxlarni taqqoslang va bir necha daqiqada bron qiling."
      />
      <HotelsBrowser />
    </SitePage>
  );
}
