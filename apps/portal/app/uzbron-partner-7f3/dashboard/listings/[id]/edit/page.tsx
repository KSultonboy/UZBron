"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ListingForm, type ListingInitial } from "@/components/listing-form";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [initial, setInitial] = useState<ListingInitial | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<ListingInitial>(`/vendor/listings/${id}`)
      .then(setInitial)
      .catch((e) => setError(e instanceof Error ? e.message : "E'lon topilmadi"));
  }, [id]);

  if (error) {
    return <div className="p-8 text-sm text-danger">{error}</div>;
  }
  if (!initial) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="mr-2 animate-spin" size={20} /> Yuklanmoqda...
      </div>
    );
  }

  return <ListingForm mode="edit" listingId={id} initial={initial} />;
}
