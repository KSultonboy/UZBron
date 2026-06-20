import { PublicSite } from "@/components/public-site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://uzbron.uz/#organization",
      name: "UZBron",
      url: "https://uzbron.uz",
      logo: "https://uzbron.uz/icon.svg",
      description: "O'zbekiston bo'ylab mehmonxona va xizmatlarni onlayn bron qilish platformasi.",
      areaServed: { "@type": "Country", name: "Uzbekistan" },
      email: "info@uzbron.uz",
    },
    {
      "@type": "WebSite",
      "@id": "https://uzbron.uz/#website",
      url: "https://uzbron.uz",
      name: "UZBron",
      inLanguage: "uz",
      publisher: { "@id": "https://uzbron.uz/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://uzbron.uz/mehmonxonalar?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicSite />
    </>
  );
}
