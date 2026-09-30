import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { Reviews } from "@/components/home/reviews";
import { AboutIntro } from "@/components/about/intro";
import { AboutWarehouse } from "@/components/about/warehouse";
import { AboutModel } from "@/components/about/model";
import { AboutSupply } from "@/components/about/supply";
import { AboutLogistics } from "@/components/about/logistics";
import { AboutTechnology } from "@/components/about/technology";
import { AboutPrinciples } from "@/components/about/principles";
import { AboutSocial } from "@/components/about/social";
import { AboutToday } from "@/components/about/today";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "importrer-avtozapchastyn" */
  const meta = await cmsMetadata("importrer-avtozapchastyn", {
    title: "Про нас — імпортер автозапчастин з Європи",
    description:
      "WestPart — логістично-сервісна B2B-платформа для професійного ринку автозапчастин. Працюємо з 2008 року, офіційний партнер Polcar в Україні.",
  });

  return meta;
}

/**
 * Сторінка об'єднує чотири сторінки старого сайту: «Про нас»,
 * «AI-платформа», «Соціальна позиція» та «Автозапчастини з Польщі».
 * Кожен блок лежить окремим компонентом у components/about.
 */
export default function AboutPage() {
  return (
    <>
      <AboutIntro />
      <AboutWarehouse />
      <AboutModel />
      <AboutSupply />
      <AboutLogistics />
      <AboutTechnology />
      <AboutPrinciples />
      <AboutSocial />

      {/* Відгуки саме тут: людина щойно прочитала, що ми про себе кажемо —
          логічно показати, що кажуть клієнти */}
      <Reviews />

      <AboutToday />
    </>
  );
}
