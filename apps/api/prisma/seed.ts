import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/** Vertikallar — MVP'da hotel faol, qolganlari kelajak uchun ro'yxatda. */
const categories = [
  { key: "hotel", nameUz: "Mehmonxonalar", nameRu: "Отели", nameEn: "Hotels", icon: "bed-outline", active: true, sort: 1 },
  { key: "dacha", nameUz: "Dachalar", nameRu: "Дачи", nameEn: "Cottages", icon: "home-outline", active: false, sort: 2 },
  { key: "restaurant", nameUz: "Restoranlar", nameRu: "Рестораны", nameEn: "Restaurants", icon: "restaurant-outline", active: false, sort: 3 },
  { key: "salon", nameUz: "Go'zallik salonlari", nameRu: "Салоны красоты", nameEn: "Beauty salons", icon: "cut-outline", active: false, sort: 4 },
  { key: "barber", nameUz: "Sartaroshxonalar", nameRu: "Барбершопы", nameEn: "Barbershops", icon: "cut-outline", active: false, sort: 5 },
  { key: "clinic", nameUz: "Shifokor va klinikalar", nameRu: "Клиники", nameEn: "Clinics", icon: "medkit-outline", active: false, sort: 6 },
  { key: "sport", nameUz: "Sport maydonlari", nameRu: "Спортплощадки", nameEn: "Sport venues", icon: "football-outline", active: false, sort: 7 },
];

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const reviews = [
  { id: "r1", author: "Jasur Karimov", initials: "JK", rating: 5, date: "2 kun oldin", text: "Ajoyib joy! Xizmat a'lo darajada, xodimlar juda xushmuomala. Albatta yana kelaman." },
  { id: "r2", author: "Madina Yusupova", initials: "MY", rating: 4, date: "1 hafta oldin", text: "Xona toza va shinam edi. Nonushta xilma-xil. Markazga yaqin joylashgani qulay." },
  { id: "r3", author: "Bekzod Aliyev", initials: "BA", rating: 5, date: "2 hafta oldin", text: "Narx-sifat nisbati zo'r. Basseyn va spa juda yoqdi. Tavsiya qilaman!" },
];

function rooms(base: number) {
  return [
    { id: "std", name: "Standart xona", capacity: 2, beds: "1 katta krovat", price: base, size: "24 m²" },
    { id: "dlx", name: "Deluxe xona", capacity: 2, beds: "1 king krovat", price: Math.round(base * 1.5), size: "32 m²" },
    { id: "suite", name: "Lyuks (Suite)", capacity: 3, beds: "1 king + divan", price: Math.round(base * 2.4), size: "48 m²" },
  ];
}

interface SeedHotel {
  id: string;
  title: string;
  city: string;
  district: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  badge?: string;
  distanceKm?: number;
  description: string;
  lat: number;
  lng: number;
  photos: string[];
  amenities: string[];
}

const hotels: SeedHotel[] = [
  {
    id: "h1",
    title: "Hilton Tashkent City",
    city: "Toshkent",
    district: "Yunusobod tumani",
    stars: 5,
    rating: 4.9,
    reviewCount: 1248,
    price: 850000,
    badge: "Mashhur",
    distanceKm: 1.2,
    description:
      "Toshkent markazidagi zamonaviy 5 yulduzli mehmonxona. Panoramali xonalar, basseyn, spa va Michelin darajasidagi restoran. Ish va dam olish uchun ideal.",
    lat: 41.3111,
    lng: 69.2797,
    photos: [u("photo-1566073771259-6a8506099945"), u("photo-1582719478250-c89cae4dc85b"), u("photo-1611892440504-42a792e24d32"), u("photo-1564501049412-61c2a3083791")],
    amenities: ["wifi", "parking", "pool", "breakfast", "gym", "spa"],
  },
  {
    id: "h2",
    title: "Hyatt Regency Tashkent",
    city: "Toshkent",
    district: "Mirobod tumani",
    stars: 5,
    rating: 4.8,
    reviewCount: 932,
    price: 1100000,
    badge: "Premium",
    distanceKm: 2.4,
    description:
      "Hashamat va qulaylik uyg'unligi. Keng xonalar, tom ustidagi bar va shahar manzarasi. Tadbirlar uchun konferens-zallar mavjud.",
    lat: 41.2995,
    lng: 69.2401,
    photos: [u("photo-1542314831-068cd1dbfeeb"), u("photo-1551882547-ff40c63fe5fa"), u("photo-1631049307264-da0ec9d70304"), u("photo-1590490360182-c33d57733427")],
    amenities: ["wifi", "parking", "pool", "breakfast", "gym", "spa", "ac"],
  },
  {
    id: "h3",
    title: "Registon Plaza",
    city: "Samarqand",
    district: "Registon yaqinida",
    stars: 4,
    rating: 4.7,
    reviewCount: 564,
    price: 620000,
    distanceKm: 0.5,
    description:
      "Tarixiy Registon maydoniga yaqin shinam mehmonxona. An'anaviy o'zbek mehmondo'stligi va zamonaviy qulayliklar.",
    lat: 39.6547,
    lng: 66.9758,
    photos: [u("photo-1455587734955-081b22074882"), u("photo-1611892440504-42a792e24d32"), u("photo-1578683010236-d716f9a3f461")],
    amenities: ["parking", "pool", "breakfast", "gym", "spa"],
  },
  {
    id: "h4",
    title: "Bukhara Palace",
    city: "Buxoro",
    district: "Eski shahar",
    stars: 4,
    rating: 4.6,
    reviewCount: 389,
    price: 480000,
    distanceKm: 0.8,
    description:
      "Buxoroning qadimiy ko'chalarida joylashgan butik mehmonxona. Hovli, an'anaviy interyer va tinch muhit.",
    lat: 39.7747,
    lng: 64.4286,
    photos: [u("photo-1520250497591-112f2f40a3f4"), u("photo-1582719508461-905c673771fd"), u("photo-1571896349842-33c89424de2d")],
    amenities: ["wifi", "parking", "pool", "breakfast", "gym"],
  },
  {
    id: "h5",
    title: "Silk Road Boutique",
    city: "Xiva",
    district: "Ichan Qal'a",
    stars: 4,
    rating: 4.8,
    reviewCount: 271,
    price: 540000,
    badge: "Yangi",
    distanceKm: 0.3,
    description:
      "Ichan Qal'a ichidagi noyob mehmonxona. UNESCO merosi qo'ynida tarixiy sayohat tajribasi.",
    lat: 41.3783,
    lng: 60.3639,
    photos: [u("photo-1596436889106-be35e843f974"), u("photo-1618773928121-c32242e63f39"), u("photo-1551776235-dde6d482980b")],
    amenities: ["pool", "breakfast", "gym", "spa", "ac"],
  },
];

async function main() {
  // 1) Kategoriyalar
  for (const c of categories) {
    await prisma.category.upsert({
      where: { key: c.key },
      update: { nameUz: c.nameUz, nameRu: c.nameRu, nameEn: c.nameEn, icon: c.icon, active: c.active, sort: c.sort },
      create: c,
    });
  }
  console.log(`✓ ${categories.length} ta kategoriya`);

  const hotelCat = await prisma.category.findUniqueOrThrow({ where: { key: "hotel" } });

  // 2) Demo vendor (egasi)
  const owner = await prisma.user.upsert({
    where: { phone: "+998901234567" },
    update: {},
    create: { phone: "+998901234567", name: "Demo Vendor", role: "VENDOR" },
  });
  const vendor = await prisma.vendor.upsert({
    where: { ownerId: owner.id },
    update: { status: "APPROVED" },
    create: { ownerId: owner.id, name: "UZBron Demo Hotels", status: "APPROVED", phone: "+998901234567" },
  });

  // 3) Mehmonxonalar (aniq ID bilan — frontend marshrutlari barqaror bo'lishi uchun)
  for (const h of hotels) {
    const attributes: Prisma.InputJsonValue = {
      stars: h.stars,
      district: h.district,
      badge: h.badge ?? null,
      distanceKm: h.distanceKm ?? null,
      amenities: h.amenities,
      reviews,
    };

    await prisma.listing.upsert({
      where: { id: h.id },
      update: {
        title: h.title,
        description: h.description,
        city: h.city,
        address: `${h.district}, ${h.city}`,
        lat: h.lat,
        lng: h.lng,
        photos: h.photos,
        attributes,
        rating: h.rating,
        reviewCount: h.reviewCount,
        status: "PUBLISHED",
      },
      create: {
        id: h.id,
        vendorId: vendor.id,
        categoryId: hotelCat.id,
        title: h.title,
        description: h.description,
        city: h.city,
        address: `${h.district}, ${h.city}`,
        lat: h.lat,
        lng: h.lng,
        photos: h.photos,
        attributes,
        rating: h.rating,
        reviewCount: h.reviewCount,
        status: "PUBLISHED",
      },
    });

    // Xonalar — har safar qayta yaratamiz (idempotent)
    await prisma.bookableUnit.deleteMany({ where: { listingId: h.id } });
    for (const room of rooms(h.price)) {
      await prisma.bookableUnit.create({
        data: {
          listingId: h.id,
          name: room.name,
          unitType: "NIGHTLY",
          capacity: room.capacity,
          basePrice: room.price,
          attributes: { roomKey: room.id, beds: room.beds, size: room.size },
        },
      });
    }
  }
  // 4) Begona (eski) hotel listinglarni tozalash — faqat h1..h5 qolsin
  const keepIds = hotels.map((h) => h.id);
  const removed = await prisma.listing.deleteMany({
    where: { categoryId: hotelCat.id, id: { notIn: keepIds } },
  });
  if (removed.count > 0) console.log(`✓ ${removed.count} ta begona listing o'chirildi`);

  console.log(`✓ ${hotels.length} ta mehmonxona + xonalari`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
