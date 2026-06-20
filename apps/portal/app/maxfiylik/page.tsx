import type { Metadata } from "next";
import { SitePage, PageHero } from "@/components/site-page";
import { LegalDoc, LegalSection } from "@/components/legal-doc";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: "UZBron foydalanuvchi ma'lumotlarini qanday yig'ishi, ishlatishi va himoya qilishi haqida.",
};

export default function MaxfiylikPage() {
  return (
    <SitePage>
      <PageHero eyebrow="Yuridik" title="Maxfiylik siyosati" />
      <LegalDoc updated="2026-yil 20-iyun">
        <p className="text-[15px] leading-relaxed text-muted">
          UZBron (&quot;biz&quot;) foydalanuvchilarning shaxsiy ma&apos;lumotlarini himoya qilishni muhim deb biladi. Ushbu
          siyosat platformadan foydalanganingizda qanday ma&apos;lumotlar yig&apos;ilishi va ulardan qanday foydalanishimizni
          tushuntiradi.
        </p>

        <LegalSection title="1. Qanday ma'lumotlarni yig'amiz">
          <p>
            Ro&apos;yxatdan o&apos;tishda: ism, telefon raqami yoki email manzili. Bron qilishda: tanlangan xizmat, sana va
            mehmonlar soni. Texnik ma&apos;lumotlar: qurilma turi va xizmatdan foydalanish statistikasi.
          </p>
        </LegalSection>

        <LegalSection title="2. Ma'lumotlardan foydalanish">
          <p>
            Ma&apos;lumotlar bronlarni amalga oshirish, xizmat sifatini yaxshilash, qo&apos;llab-quvvatlash ko&apos;rsatish va
            qonun talablariga rioya qilish uchun ishlatiladi. Biz ma&apos;lumotlaringizni uchinchi shaxslarga sotmaymiz.
          </p>
        </LegalSection>

        <LegalSection title="3. Ma'lumotlarni baham ko'rish">
          <p>
            Bron amalga oshganda zarur ma&apos;lumotlar (ism, sana) faqat tegishli xizmat ko&apos;rsatuvchi bilan ulashiladi.
            Boshqa hollarda ma&apos;lumotlar maxfiy saqlanadi.
          </p>
        </LegalSection>

        <LegalSection title="4. Xavfsizlik">
          <p>
            Ma&apos;lumotlar shifrlangan kanallar orqali uzatiladi va himoyalangan serverlarda saqlanadi. Parollar
            qaytarib bo&apos;lmaydigan usulda saqlanadi.
          </p>
        </LegalSection>

        <LegalSection title="5. Sizning huquqlaringiz">
          <p>
            Siz istalgan vaqtda hisobingizni va unga bog&apos;liq ma&apos;lumotlarni o&apos;chirishingiz mumkin. Buning uchun
            ilova sozlamalaridan foydalaning yoki <a className="text-primary underline" href="mailto:info@uzbron.uz">info@uzbron.uz</a> ga
            murojaat qiling.
          </p>
        </LegalSection>

        <LegalSection title="6. Bog'lanish">
          <p>
            Maxfiylik bo&apos;yicha savollar uchun: <a className="text-primary underline" href="mailto:info@uzbron.uz">info@uzbron.uz</a>.
          </p>
        </LegalSection>
      </LegalDoc>
    </SitePage>
  );
}
