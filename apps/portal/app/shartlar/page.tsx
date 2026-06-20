import type { Metadata } from "next";
import { SitePage, PageHero } from "@/components/site-page";
import { LegalDoc, LegalSection } from "@/components/legal-doc";

export const metadata: Metadata = {
  title: "Foydalanish shartlari",
  description: "UZBron platformasidan foydalanish shartlari va qoidalari.",
};

export default function ShartlarPage() {
  return (
    <SitePage>
      <PageHero eyebrow="Yuridik" title="Foydalanish shartlari" />
      <LegalDoc updated="2026-yil 20-iyun">
        <p className="text-[15px] leading-relaxed text-muted">
          UZBron platformasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz. Iltimos, ulardan
          foydalanishdan oldin diqqat bilan o&apos;qing.
        </p>

        <LegalSection title="1. Platforma haqida">
          <p>
            UZBron — mijozlar va xizmat ko&apos;rsatuvchilarni bog&apos;lovchi bron platformasi. Biz xizmat
            ko&apos;rsatuvchi emas, balki vositachi platformamiz; bron sharti va sifati tegishli biznes zimmasida.
          </p>
        </LegalSection>

        <LegalSection title="2. Hisob va ro'yxatdan o'tish">
          <p>
            Foydalanuvchi to&apos;g&apos;ri ma&apos;lumot kiritishi va hisobi xavfsizligini ta&apos;minlashi shart. Bir shaxs
            nomidan firibgarlik maqsadida bir nechta hisob ochish taqiqlanadi.
          </p>
        </LegalSection>

        <LegalSection title="3. Bron va bekor qilish">
          <p>
            Bron tasdiqlangach, bekor qilish shartlari tegishli xizmat ko&apos;rsatuvchining qoidalariga bog&apos;liq. Har bir
            e&apos;lon sahifasida bekor qilish shartlari ko&apos;rsatiladi.
          </p>
        </LegalSection>

        <LegalSection title="4. Biznes hamkorlar">
          <p>
            Xizmat ko&apos;rsatuvchilar to&apos;g&apos;ri va dolzarb ma&apos;lumot (narx, bo&apos;sh joy, qulayliklar) joylashi
            shart. Noto&apos;g&apos;ri ma&apos;lumot yoki shikoyatlar e&apos;lonni bloklashga sabab bo&apos;lishi mumkin.
          </p>
        </LegalSection>

        <LegalSection title="5. Taqiqlangan harakatlar">
          <p>
            Platformadan noqonuniy maqsadlarda, boshqalarni aldash yoki tizim ishiga zarar yetkazish uchun foydalanish
            taqiqlanadi. Qoidabuzarlik hisobni bloklashga olib keladi.
          </p>
        </LegalSection>

        <LegalSection title="6. Javobgarlik cheklovi">
          <p>
            UZBron xizmat ko&apos;rsatuvchi va mijoz o&apos;rtasidagi nizolar uchun bevosita javobgar emas, biroq adolatli
            yechimga ko&apos;maklashadi. Platforma &quot;mavjud holatida&quot; taqdim etiladi.
          </p>
        </LegalSection>

        <LegalSection title="7. O'zgartirishlar">
          <p>
            Biz ushbu shartlarni vaqti-vaqti bilan yangilashimiz mumkin. Yangilangan shartlar ushbu sahifada
            e&apos;lon qilinadi. Savollar uchun: <a className="text-primary underline" href="mailto:info@uzbron.uz">info@uzbron.uz</a>.
          </p>
        </LegalSection>
      </LegalDoc>
    </SitePage>
  );
}
