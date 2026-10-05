import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { CatalogIntro } from "@/components/catalog-page/intro";
import { CatalogCategories } from "@/components/catalog-page/categories";
import { CatalogCarBrands } from "@/components/catalog-page/car-brands";
import { CatalogSuppliers } from "@/components/catalog-page/suppliers";
import { VinBanner } from "@/components/home/vin-banner";
import { getCarBrands, getCatalogCategories } from "@/lib/api/catalog";

/* Збірка Vercel виконується у Вашингтоні, а Cloudflare перед бекендом
   звідти не пропускає запити — тому одразу після деплою каталог
   прегенерується порожнім. Невеликий інтервал дає сторінці самій
   відновитися за кілька хвилин: ревалідація вже йде з Франкфурта.
   Коли бекенд відкриє доступ для збірки, можна повернути годину. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "brands" */
  const meta = await cmsMetadata("brands", {
    title:
      "Каталог автозапчастин — за категорією, маркою авто й постачальником",
    description:
      "Каталог WestPart: пошук за артикулом і OEM-номером, підбір за маркою авто та категорією, прямі поставки Polcar, Signeda, NTY, DEPO і SRLine.",
  });

  return meta;
}

export default async function CatalogPage() {
  /* Обидва довідники незалежні — тягнемо паралельно */
  const [categories, carBrands] = await Promise.all([
    getCatalogCategories(),
    getCarBrands(),
  ]);

  return (
    <>
      <CatalogIntro />
      <CatalogCategories items={categories} />
      <CatalogCarBrands items={carBrands} />
      <CatalogSuppliers />

      {/* Якщо людина не знайшла деталь у каталозі — наступний крок VIN */}
      <VinBanner />
    </>
  );
}
