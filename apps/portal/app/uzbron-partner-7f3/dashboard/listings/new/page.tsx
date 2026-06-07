"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Check, ImagePlus, Save, Star } from "lucide-react";
import { api } from "@/lib/api";
import { PARTNER_LISTINGS } from "@/lib/portal-paths";

const amenities = [
  { key: "wifi", label: "Bepul Wi-Fi" },
  { key: "parking", label: "Avtoturargoh" },
  { key: "pool", label: "Basseyn" },
  { key: "breakfast", label: "Nonushta" },
  { key: "gym", label: "Sport zali" },
  { key: "spa", label: "Spa" },
];

export default function NewPartnerListingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["wifi"]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await api("/vendor/listings", {
        method: "POST",
        body: {
          title: form.get("title"),
          city: form.get("city"),
          district: form.get("district"),
          description: form.get("description"),
          stars: Number(form.get("stars")),
          basePrice: Number(form.get("basePrice")),
          photos: String(form.get("photos") ?? "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          amenities: selectedAmenities,
        },
      });
      router.push(PARTNER_LISTINGS);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saqlashda xato yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

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
        <h1 className="text-2xl font-bold sm:text-3xl">Yangi mehmonxona</h1>
        <p className="mt-2 text-sm text-muted">Asosiy ma&apos;lumotlarni kiriting va e&apos;lonni joylang.</p>
      </div>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <SectionTitle icon={Building2} title="Asosiy ma'lumotlar" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Mehmonxona nomi" required>
              <input name="title" required className="form-input" placeholder="Masalan, UZBron Plaza" />
            </Field>
            <Field label="Yulduzlar soni" required>
              <select name="stars" defaultValue="4" className="form-input">
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} yulduz</option>
                ))}
              </select>
            </Field>
            <Field label="Shahar" required>
              <input name="city" required className="form-input" placeholder="Toshkent" />
            </Field>
            <Field label="Tuman yoki manzil">
              <input name="district" className="form-input" placeholder="Shayxontohur tumani" />
            </Field>
            <Field label="Bir kecha narxi" required>
              <div className="relative">
                <input
                  name="basePrice"
                  required
                  type="number"
                  min="0"
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
                className="form-input min-h-32 resize-y py-3"
                placeholder="Mehmonxona, joylashuv va xizmatlar haqida qisqacha..."
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <SectionTitle icon={ImagePlus} title="Rasmlar" />
          <Field label="Rasm havolalari" hint="Har bir URL'ni yangi qatordan kiriting">
            <textarea
              name="photos"
              rows={4}
              className="form-input min-h-28 resize-y py-3"
              placeholder={"https://example.com/hotel-1.jpg\nhttps://example.com/hotel-2.jpg"}
            />
          </Field>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <SectionTitle icon={Star} title="Qulayliklar" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => {
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
            {saving ? "Saqlanmoqda..." : "E'lonni saqlash"}
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
