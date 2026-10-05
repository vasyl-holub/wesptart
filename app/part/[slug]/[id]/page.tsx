import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CircleCheckIcon, StarFilledIcon } from "@/components/ui/icons";
import { RegionBar } from "@/components/layout/region-bar";
import { PartGallery } from "@/components/catalog/part-gallery";
import { PartInfoCard } from "@/components/catalog/part-info-card";
import { PartActions } from "@/components/catalog/part-actions";
import { PriceLevel } from "@/components/catalog/price-level";
import { PartReviews } from "@/components/catalog/part-reviews";
import { ViewTracker } from "@/components/catalog/view-tracker";
import { PartOffers } from "@/components/catalog/part-offers";
import { PartCompat } from "@/components/catalog/part-compat";
import { PartRecommended } from "@/components/catalog/part-recommended";
import { VinBanner } from "@/components/home/vin-banner";
import type { OfferRow } from "@/components/catalog/offers-table";
import { getProductSeo } from "@/lib/api/seo";
import { getProduct, productTitle } from "@/lib/api/product";

export async function generateMetadata({
  params,
}: PageProps<"/part/[slug]/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return { title: "Товар не знайдено" };

  const title = productTitle(product);

  /* Замовник веде title і description під кожен товар у своїй адмінці —
     беремо їх, а власні лишаємо запасним варіантом */
  const seo = await getProductSeo(product.id);

  return {
    title: seo?.title ?? title,
    description:
      seo?.metaDescription ??
      `${title}. Ціна, наявність і строк доставки. Оригінальні та аналогові автозапчастини з Європи.`,
    alternates: { canonical: `/part/${product.slug}/${product.id}` },
  };
}

export default async function PartPage({
  params,
}: PageProps<"/part/[slug]/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const title = productTitle(product);
  const inStock = Boolean(
    product.bestOffer?.canBuy && (product.bestOffer?.count ?? 0) > 0,
  );

  /* Крос-номери — теж характеристика, показуємо їх у тій самій таблиці */
  const specs = [
    ...product.specs,
    ...(product.weight
      ? [{ label: "Вага", value: `${product.weight} кг` }]
      : []),
    ...(product.crosses.length
      ? [
          {
            label: "Крос-номери",
            value: product.crosses
              .map((c) => [c.brand, c.num].filter(Boolean).join(" "))
              .join(", "),
          },
        ]
      : []),
  ];

  /* Сумісність із авто окремим полем API не віддає: `simpleCars` у товару
     не фільтрується (однакові 99 535 записів для будь-якого артикула), а
     productCarSimpleAll(product:) завжди повертає нуль. Єдине робоче
     джерело — характеристика «Модель». */
  const fitsFor =
    product.specs.find((s) => s.label.toLowerCase().startsWith("модель"))
      ?.value ?? null;

  /* Варіанти поставки — це той самий товар з різних складів: артикул,
     бренд і якість у них спільні, різняться ціна, строк і залишок */
  const variantRows: OfferRow[] = product.offers.map((o) => ({
    key: o.id,
    offerId: o.id,
    brand: product.brand,
    num: product.num,
    name: product.name,
    quality: product.quality,
    deliveryDays: o.deliveryDays,
    count: o.count,
    price: o.price,
    canBuy: o.canBuy,
    image: product.images[0] ?? null,
  }));

  const analogueRows: OfferRow[] = product.analogues.map((a) => ({
    key: a.id,
    offerId: a.offer.id,
    brand: a.brand,
    num: a.num,
    name: a.name,
    quality: a.quality,
    deliveryDays: a.offer.deliveryDays,
    count: a.offer.count,
    price: a.offer.price,
    canBuy: a.offer.canBuy,
    image: a.image,
    href: `/part/${a.slug}/${a.id}`,
  }));

  return (
    <>
      <RegionBar />

      <section className="bg-white py-12">
        <Container className="flex flex-col gap-7">
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: title },
            ]}
          />

          <div className="flex flex-col gap-2.5">
            {product.voteCount > 0 && (
              /* Клік по зірочках веде до секції відгуків нижче */
              <a
                href="#reviews"
                className="flex w-fit items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarFilledIcon
                      key={i}
                      className={
                        i < Math.round(product.rating)
                          ? "size-4 text-blue-300"
                          : "size-4 text-grey-200"
                      }
                    />
                  ))}
                </span>
                <span className="text-[16px] leading-[1.5] text-grey-700">
                  ({product.commentQty})
                </span>
              </a>
            )}

            <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span
                className={
                  inStock
                    ? "flex h-9 items-center gap-2 rounded-[8px] bg-green-50 px-3 text-[14px] font-semibold leading-[1.5] text-green-300"
                    : "flex h-9 items-center gap-2 rounded-[8px] bg-grey-100 px-3 text-[14px] font-semibold leading-[1.5] text-grey-700"
                }
              >
                <CircleCheckIcon className="size-6 shrink-0" />
                {inStock ? "В наявності" : "Немає в наявності"}
              </span>

              {product.code && (
                <p className="flex gap-2 text-[16px] leading-[1.5]">
                  <span className="text-grey-700">Код товару:</span>
                  <span className="tnum font-semibold text-black-900">
                    {product.code}
                  </span>
                </p>
              )}

              {product.brand && (
                <p className="flex gap-2 text-[16px] leading-[1.5]">
                  <span className="text-grey-700">Виробник:</span>
                  <span className="font-semibold text-black-900">
                    {product.brand}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* У макеті три рівні колонки по 380. Тримаємо їх рівними й нижче,
              щоб ширину втрачали всі однаково, а не одна середня.
              1024–1279: галерея і купівля в рядок, опис під ними на всю ширину. */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <div id="gallery" className="scroll-mt-24 lg:order-1">
              <PartGallery photos={product.images} alt={title} />
            </div>

            <div
              id="specs"
              className="scroll-mt-24 lg:order-3 lg:col-span-2 xl:order-2 xl:col-span-1"
            >
              <PartInfoCard specs={specs} />
            </div>

            <div className="flex flex-col gap-3 lg:order-2 xl:order-3">
              <PartActions product={product} />
              <PriceLevel />
            </div>
          </div>
        </Container>
      </section>

      <ViewTracker productId={product.id} />

      <PartOffers variants={variantRows} analogues={analogueRows} />

      <PartCompat article={product.num} fitsFor={fitsFor} />

      <VinBanner tight />

      <PartReviews
        productPk={product.id}
        rating={product.rating}
        voteCount={product.voteCount}
      />

      <PartRecommended excludeId={product.id} />
    </>
  );
}
