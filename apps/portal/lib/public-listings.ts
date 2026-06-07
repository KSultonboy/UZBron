export interface PublicHotel {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  photos: string[];
  badge?: string | null;
}

export const FALLBACK_HOTELS: PublicHotel[] = [
  {
    id: "fallback-hilton",
    title: "Hilton Tashkent City",
    description: "Toshkent markazidagi zamonaviy va qulay mehmonxona.",
    city: "Toshkent",
    district: "Shayxontohur tumani",
    stars: 5,
    rating: 4.9,
    reviewCount: 1248,
    price: 850000,
    badge: "Mashhur",
    photos: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  {
    id: "fallback-silk-road",
    title: "Silk Road by Minyoun",
    description: "Samarqandning tarixiy muhiti va premium xizmatlar uyg'unligi.",
    city: "Samarqand",
    district: "Silk Road Samarkand",
    stars: 5,
    rating: 4.8,
    reviewCount: 936,
    price: 720000,
    badge: "Yangi",
    photos: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  {
    id: "fallback-wyndham",
    title: "Wyndham Bukhara",
    description: "Buxoro markazida sokin dam olish va sifatli servis.",
    city: "Buxoro",
    district: "Eski shahar yaqinida",
    stars: 4,
    rating: 4.7,
    reviewCount: 614,
    price: 540000,
    badge: "Top tanlov",
    photos: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  {
    id: "fallback-khiva",
    title: "Farovon Khiva",
    description: "Xiva bo'ylab sayohat uchun shinam va ishonchli manzil.",
    city: "Xiva",
    district: "Ichan qal'a yaqinida",
    stars: 4,
    rating: 4.6,
    reviewCount: 382,
    price: 430000,
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
    ],
  },
];

export const CITY_CARDS = [
  {
    name: "Toshkent",
    count: 248,
    image:
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Samarqand",
    count: 132,
    image:
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Buxoro",
    count: 87,
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Xiva",
    count: 54,
    image:
      "https://images.unsplash.com/photo-1631281956016-3cdc1b2fe5fb?auto=format&fit=crop&w=1000&q=85",
  },
];
