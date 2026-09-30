import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { Hero } from "@/components/home/hero";
import { Brands } from "@/components/home/brands";
import { PolcarCatalog } from "@/components/home/polcar-catalog";
import { VinBanner } from "@/components/home/vin-banner";
import { Promo } from "@/components/home/promo";
import { Advantages } from "@/components/home/advantages";
import { Reviews } from "@/components/home/reviews";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "main" */
  const meta = await cmsMetadata("main", {
    title: "Автозапчастини з Польщі та ЄС в одному B2B-кабінеті",
    description:
      "Кузовні деталі, оптика, охолодження та механіка з Польщі та ЄС. Точний підбір по VIN, аналоги по брендах, швидка доставка. Polcar, Signeda, NTY, DEPO, SRLine.",
  });

  return meta;
}

export default function Home() {
  return (
    <>
      <Hero />
      <Brands />
      <PolcarCatalog />
      <VinBanner />
      <Promo />
      <Advantages />
      <Reviews />
    </>
  );
}
