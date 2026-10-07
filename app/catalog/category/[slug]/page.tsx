import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { ChevronRightIcon } from "@/components/ui/icons";
import { PartCard } from "@/components/catalog/part-card";
import { VinBanner } from "@/components/home/vin-banner";
import { getCategory } from "@/lib/api/catalog";
import { getProductsByGroup } from "@/lib/api/product";
import { pluralize } from "@/lib/plural";
import { getCategorySeo } from "@/lib/api/seo";

const PER_PAGE = 24;

export async function generateMetadata({
  params,
}: PageProps<"/catalog/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Категорію не знайдено" };

  /* Тексти під категорії веде замовник в адмінці — наші лишаються запасними */
  const seo = await getCategorySeo(category.id);

  return {
    title: seo?.title ?? `${category.name} — каталог автозапчастин`,
    description:
      seo?.metaDescription ??
      `${category.name}: ціни, наявність і строки поставки. Підбір за артикулом, OEM-номером або VIN.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/catalog/category/[slug]">) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(rawPage) || 1);
  const isLeaf = category.children.length === 0;

  /* Товари лежать лише на листках дерева — у вузлів з підкатегоріями
     показуємо не список товарів, а наступний рівень */
  const products = isLeaf
    ? await getProductsByGroup(category.id, page, PER_PAGE)
    : { items: [], total: 0 };

  const crumbs: Crumb[] = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...category.breadcrumbs.map((b, i, all) =>
      i === all.length - 1
        ? { label: b.name }
        : { label: b.name, href: `/catalog/category/${b.slug}` },
    ),
  ];

  const pages = Math.ceil(products.total / PER_PAGE);
  const basePath = `/catalog/category/${category.slug}`;

  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container className="flex flex-col gap-4">
          <Breadcrumbs items={crumbs} />

          <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
            {category.name}
          </h1>

          <p className="text-[16px] leading-[1.6] text-grey-700">
            {isLeaf
              ? `${pluralize(products.total, "позиція", "позиції", "позицій")} у категорії`
              : `${pluralize(category.children.length, "підкатегорія", "підкатегорії", "підкатегорій")}`}
          </p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          {!isLeaf && (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.children.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalog/category/${c.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-[12px] border border-grey-200 px-5 py-4 transition-colors hover:border-blue-300"
                  >
                    <span className="text-[15px] leading-[1.5] text-black-900">
                      {c.name}
                    </span>
                    <ChevronRightIcon className="size-5 shrink-0 text-grey-600 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {isLeaf && products.items.length === 0 && (
            <p className="rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center text-[15px] text-grey-600">
              У цій категорії поки немає позицій. Спробуйте пошук за артикулом
              або надішліть VIN — підберемо вручну.
            </p>
          )}

          {isLeaf && products.items.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.items.map((p) => (
                  <PartCard key={p.id} product={p} />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <Pagination
                  current={page}
                  total={pages}
                  hrefFor={(p) =>
                    p === 1 ? basePath : `${basePath}?page=${p}`
                  }
                />
                <p className="tnum text-[13px] leading-[1.5] text-grey-600">
                  Сторінка {page} з {pages} · усього{" "}
                  {pluralize(products.total, "позиція", "позиції", "позицій")}
                </p>
              </div>
            </>
          )}
        </Container>
      </section>

      <VinBanner />
    </>
  );
}
