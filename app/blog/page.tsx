import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { ArticleCard } from "@/components/blog/article-card";
import { Promo } from "@/components/home/promo";
import { getArticles } from "@/lib/api/content";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "article" */
  const meta = await cmsMetadata("article", {
    title: "Статті про автозапчастини та роботу СТО",
    description:
      "Матеріали WestPart для СТО, магазинів і партнерів: як влаштований ринок автозапчастин, підбір деталей, логістика та системна робота бізнесу.",
  });

  return meta;
}

function hrefFor(page: number) {
  return page === 1 ? "/blog" : `/blog?page=${page}`;
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const raw = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1;

  const { edges, totalCount, pagesCount } = await getArticles(page);

  /* Сторінка поза діапазоном — 404, а не порожній список:
     інакше пошуковики індексували б безліч порожніх адрес */
  if (page > 1 && edges.length === 0) notFound();

  return (
    <>
      <Container className="pb-8 pt-6 lg:pb-12">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Статті" }]}
        />

        <div className="mt-6 flex flex-col gap-3">
          <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
            Статті
          </h1>
          <p className="max-w-[640px] text-[16px] leading-[1.6] text-grey-700">
            Пишемо про те, як влаштований ринок автозапчастин, і про рішення,
            які допомагають СТО та магазинам працювати без простоїв.
          </p>
        </div>

        {edges.length === 0 ? (
          <p className="mt-10 rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center text-[15px] text-grey-600">
            Статей поки немає. Зазирніть трохи згодом.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
              {edges.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <Pagination current={page} total={pagesCount} hrefFor={hrefFor} />
              <p className="tnum text-[13px] leading-[1.5] text-grey-600">
                Сторінка {page} з {pagesCount} · усього {totalCount} статей
              </p>
            </div>
          </>
        )}
      </Container>

      {/* Дочитали список — даємо шлях у каталог, як і на сторінці статті */}
      <Promo />
    </>
  );
}
