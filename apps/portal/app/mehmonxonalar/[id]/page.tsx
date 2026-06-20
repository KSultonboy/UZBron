import { SitePage } from "@/components/site-page";
import { HotelDetail } from "@/components/hotel-detail";

export default async function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SitePage>
      <HotelDetail id={id} />
    </SitePage>
  );
}
