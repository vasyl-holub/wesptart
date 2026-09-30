import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import { removeFavoriteAction } from "@/app/account/actions";
import { getFavorites } from "@/lib/api/account";
import { productTitle } from "@/lib/api/product";

export const metadata: Metadata = {
  title: "Обране",
  robots: { index: false, follow: false },
};

const PER_PAGE = 12;

export default async function FavoritesPage({
  searchParams,
}: PageProps<"/account/favorites">) {
  const sp = await searchParams;
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const data = await getFavorites(page, PER_PAGE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Обране
        </h2>
        <span className="tnum text-[15px] leading-[1.5] text-grey-700">
          Збережено: {data.totalCount}
        </span>
      </div>

      {data.items.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-grey-200 p-5"
              >
                <h3 className="min-w-0 text-[16px] font-semibold leading-[1.5] text-black-900">
                  <Link
                    href={`/part/${item.slug}/${item.productId}`}
                    className="transition-colors hover:text-blue-300"
                  >
                    {productTitle(item)}
                  </Link>
                </h3>

                <form action={removeFavoriteAction} className="shrink-0">
                  <input
                    type="hidden"
                    name="productId"
                    value={item.productId}
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-[8px] px-3 text-[14px] leading-[1.5] text-grey-700 transition-colors hover:bg-danger-50 hover:text-danger-700"
                  >
                    Прибрати
                  </button>
                </form>
              </li>
            ))}
          </ul>

          {data.pagesCount > 1 && (
            <Pagination
              current={page}
              total={data.pagesCount}
              hrefFor={(n) =>
                n > 1 ? `/account/favorites?page=${n}` : "/account/favorites"
              }
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-[16px] border border-grey-200 p-6">
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Тут зберігаються деталі, які ви позначили в каталозі — щоб не шукати
            артикул удруге.
          </p>
          <Link
            href="/catalog"
            className={buttonClasses({ variant: "primary" })}
          >
            До каталогу
          </Link>
        </div>
      )}
    </div>
  );
}
