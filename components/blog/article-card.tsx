import Image from "next/image";
import { isRemoteImage } from "@/lib/images";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import { mediaUrl } from "@/lib/api/graphql";
import {
  articleImageUrl,
  formatArticleDate,
  type ArticleListItem,
} from "@/lib/api/content";

/** Текст анонсу приходить із переносами рядків — прибираємо їх для картки */
function excerpt(text: string | null) {
  return text?.replace(/\s+/g, " ").trim() ?? "";
}

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const cover = mediaUrl(articleImageUrl(article.image));

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[20px] border border-grey-200 bg-white transition-[border-color,box-shadow] hover:border-blue-300 hover:shadow-md">
      {/* Фото є не в кожної статті — без нього картка просто текстова */}
      {cover && (
        <div className="relative aspect-16/9 overflow-hidden bg-grey-100">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized={isRemoteImage(cover)}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <time
          dateTime={article.created ?? undefined}
          className="text-[13px] leading-[1.5] text-grey-600"
        >
          {formatArticleDate(article.created)}
        </time>

        <h2 className="text-balance text-[18px] font-semibold leading-[1.35] text-black-900 transition-colors group-hover:text-blue-300">
          <Link
            href={`/blog/${article.slug}`}
            className="before:absolute before:inset-0"
          >
            {article.name}
          </Link>
        </h2>

        {article.textShort && (
          <p className="line-clamp-3 text-pretty text-[14px] leading-[1.6] text-grey-700">
            {excerpt(article.textShort)}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[14px] font-semibold leading-[1.5] text-blue-300">
          Читати
          <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
