import type { Metadata } from "next";
import Image from "next/image";
import { isRemoteImage } from "@/lib/images";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mediaUrl } from "@/lib/api/graphql";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleCard } from "@/components/blog/article-card";
import { ShareArticle } from "@/components/blog/share";
import { Promo } from "@/components/home/promo";
import { buttonClasses } from "@/components/ui/button";
import {
  articleImageUrl,
  formatArticleDate,
  getArticle,
  getArticles,
  minutesLabel,
  readingMinutes,
  cleanArticleHtml,
} from "@/lib/api/content";

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Статтю не знайдено" };

  const description = article.description || article.textShort || undefined;

  return {
    title: article.name,
    description,
    keywords: article.keywords || undefined,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.name,
      description,
      publishedTime: article.created ?? undefined,
      modifiedTime: article.modified,
      url: `/blog/${article.slug}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  /* Читаємо решту статей для блоку «Інші матеріали» */
  const { edges } = await getArticles(1);
  const others = edges.filter((a) => a.slug !== article.slug).slice(0, 3);

  const published = formatArticleDate(article.created);
  const cover = mediaUrl(articleImageUrl(article.image));
  const minutes = readingMinutes(article.text);

  return (
    <>
      <article>
        <Container className="py-8 lg:py-12">
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Статті", href: "/blog" },
              { label: article.name },
            ]}
          />

          {/* Колонка для читання: обмежена ширина й по центру.
              Рядок довший за ~90 символів читати важко, а ліворуч
              притиснутий текст на широкому екрані виглядає покинутим. */}
          <div className="mx-auto mt-8 max-w-[920px]">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] leading-[1.5] text-grey-600">
                {published && (
                  <time dateTime={article.created ?? undefined}>
                    {published}
                  </time>
                )}
                <span aria-hidden className="size-1 rounded-full bg-grey-300" />
                <span>{minutesLabel(minutes)} читання</span>
              </div>

              <h1 className="text-balance text-[28px] font-semibold leading-[1.25] text-black-900 lg:text-[40px]">
                {article.name}
              </h1>

              {article.textShort && (
                <p className="text-pretty text-[18px] leading-[1.6] text-grey-700">
                  {article.textShort.replace(/\s+/g, " ").trim()}
                </p>
              )}
            </header>

            {cover && (
              /* Обкладинки — банери з текстом усередині, до того ж різних
                 пропорцій: 3:2, 1:1, 16:9. Будь-який кроп зрізає напис,
                 тому показуємо зображення повністю, у власних пропорціях. */
              <Image
                src={cover}
                alt=""
                width={1536}
                height={1024}
                priority
                sizes="(min-width: 1024px) 920px, 100vw"
                className="mt-8 h-auto w-full rounded-[20px] bg-grey-100"
                unoptimized={isRemoteImage(cover)}
              />
            )}

            {/* Текст приходить готовим HTML із адмінки бекенду */}
            <div
              className="article-body mt-10"
              dangerouslySetInnerHTML={{
                __html: cleanArticleHtml(article.text, article.name),
              }}
            />

            <div className="mt-10 border-t border-grey-200 pt-6">
              <ShareArticle title={article.name} />
            </div>
          </div>
        </Container>
      </article>

      {/* Заклик після прочитання */}
      <section className="bg-blue-700 py-12">
        <Container>
          <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-[560px] flex-col gap-2">
              <h2 className="text-balance text-[22px] font-semibold leading-[1.4] text-white lg:text-[26px]">
                Потрібна деталь — а не теорія?
              </h2>
              <p className="text-pretty text-[15px] leading-[1.6] text-blue-50">
                Надішліть VIN або номер деталі — підберемо, перевіримо наявність
                і назвемо строк доставки.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
              >
                Зареєструватися
              </Link>
              <Link
                href="/contacts"
                className="inline-flex h-12 items-center justify-center rounded-[8px] border border-white/30 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
              >
                Написати нам
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {others.length > 0 && (
        <section className="py-12 lg:py-16">
          <Container className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
                Інші матеріали
              </h2>
              <Link
                href="/blog"
                className={buttonClasses({ variant: "outline", size: "md" })}
              >
                Усі статті
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <Promo />
    </>
  );
}
