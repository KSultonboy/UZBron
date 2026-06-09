"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Check, ImagePlus, Loader2, Save, Star, Upload, X } from "lucide-react";
import { api, uploadFile } from "@/lib/api";
import { PARTNER_LISTINGS } from "@/lib/portal-paths";

const amenityOptions = [
  { key: "wifi", label: "Bepul Wi-Fi" },
  { key: "parking", label: "Avtoturargoh" },
  { key: "pool", label: "Basseyn" },
  { key: "breakfast", label: "Nonushta" },
  { key: "gym", label: "Sport zali" },
  { key: "spa", label: "Spa" },
];

export interface ListingInitial {
  title?: string;
  city?: string;
  district?: string;
  description?: string;
  stars?: number;
  basePrice?: number;
  photos?: string[];
  amenities?: string[];
}

export function ListingForm({
  mode,
  listingId,
  initial,
}: {
  mode: "new" | "edit";
  listingId?: string;
  initial?: ListingInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initial?.amenities ?? ["wifi"]);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);

  const onPickFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const { url } = await uploadFile("/uploads", file);
        setPhotos((prev) => [...prev, url]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rasm yuklashda xato");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) => setPhotos((prev) => prev.filter((p) => p !== url));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = {
      title: form.get("title"),
      city: form.get("city"),
      district: form.get("district"),
      description: form.get("description"),
      stars: Number(form.get("stars")),
      basePrice: Number(form.get("basePrice")),
      photos,
      amenities: selectedAmenities,
    };
    try {
      if (mode === "edit" && listingId) {
        await api(`/vendor/listings/${listingId}`, { method: "PATCH", body });
      } else {
        await api("/vendor/listings", { method: "POST", body });
      }
      router.push(PARTNER_LISTINGS);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saqlashda xato yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (key: string) =>
    setSelectedAmenities((c) => (c.includes(key) ? c.filter((i) => i !== key) : [...c, key]));

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft size={17} />
        Orqaga
      </button>
      <div className="mt-5">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {mode === "edit" ? "Mehmonxonani tahrirlash" : "Yangi mehmonxona"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "edit"
            ? "Ma'lumotlarni yangilab, saqlang."
            : "Asosiy ma'lumotlarni kiriting va e'lonni joylang."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <SectionTitle icon={Building2} title="Asosiy ma'lumotlar" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Mehmonxona nomi" required>
              <input name="title" required defaultValue={initial?.title} className="form-input" placeholder="Masalan, UZBron Plaza" />
            </Field>
            <Field label="Yulduzlar soni" required>
              <select name="stars" defaultValue={String(initial?.stars ?? 4)} className="form-input">
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} yulduz</option>
                ))}
              </select>
            </Field>
            <Field label="Shahar" required>
              <input name="city" required defaultValue={initial?.city} className="form-input" placeholder="Toshkent" />
            </Field>
            <Field label="Tuman yoki manzil">
              <input name="district" defaultValue={initial?.district} className="form-input" placeholder="Shayxontohur tumani" />
            </Field>
            <Field label="Bir kecha narxi" required>
              <div className="relative">
                <input
                  name="basePrice"
                  required
                  type="number"
                  min="0"
                  defaultValue={initial?.basePrice}
                  className="form-input pr-20"
                  placeholder="850000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">so&apos;m</span>
              </div>
            </Field>
            <div className="hidden sm:block" />
            <Field label="Tavsif" className="sm:col-span-2">
              <textarea
                name="description"
                rows={5}
                defaultValue={initial?.description}
                className="form-input min-h-32 resize-y py-3"
                placeholder="Mehmonxona, joylashuv va xizmatlar haqida qisqacha..."
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <SectionTitle icon={ImagePlus} title="Rasmlar" />
          <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((url) => (
              <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
                <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Rasmni o'chirish"
                >
                  <X size={15} />
                </button>
              </div>
            ))}

            <label
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-muted transition hover:border-primary hover:text-primary ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={26} className="animate-spin" />
                  <span className="text-xs font-semibold">Yuklanmoqda...</span>
                </>
              ) : (
                <>
                  <Upload size={26} />
                  <span className="text-xs font-semibold">Rasm yuklash</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onPickFiles}
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-subtle">JPG, PNG yoki WEBP · har biri 6 MB gacha · bir nechta tanlash mumkin</p>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <SectionTitle icon={Star} title="Qulayliklar" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenityOptions.map((amenity) => {
              const active = selectedAmenities.includes(amenity.key);
              return (
                <button
                  type="button"
                  key={amenity.key}
                  onClick={() => toggleAmenity(amenity.key)}
                  className={`flex h-11 items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition ${
                    active ? "border-primary bg-primary-50 text-primary" : "border-line text-muted hover:bg-canvas"
                  }`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded border ${active ? "border-primary bg-primary text-white" : "border-line"}`}>
                    {active && <Check size={13} />}
                  </span>
                  {amenity.label}
                </button>
              );
            })}
          </div>
        </section>

        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-11 rounded-lg border border-line bg-white px-5 text-sm font-semibold text-muted"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saqlanmoqda..." : mode === "edit" ? "O'zgarishlarni saqlash" : "E'lonni saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Building2; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line pb-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-primary">
        <Icon size={18} />
      </div>
      <h2 className="font-bold">{title}</h2>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {hint && <span className="ml-2 text-xs font-normal text-subtle">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}
