import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import { getViewedProducts } from "@/lib/api/history";
import { productTitle } from "@/lib/api/product";
import { formatDateShort } from "@/lib/format-date";

export const metadata: Metadata = {
  title: "Переглянуті товари",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

export default async function HistoryPage({
  searchParams,
}: PageProps<"/account/history">) {
  const sp = await searchParams;
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const data = await getViewedProducts(page, PER_PAGE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
            Переглянуті товари
          </h2>
          <span className="tnum text-[15px] leading-[1.5] text-grey-700">
            Усього: {data.totalCount}
          </span>
        </div>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Деталі, які ви відкривали. Зручно, коли треба повернутися до позиції,
          артикул якої не записали.
        </p>
      </div>

      {data.items.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[16px] border border-grey-200 p-5 transition-colors hover:border-blue-300"
              >
                <h3 className="min-w-0 flex-1 text-[16px] font-semibold leading-[1.5] text-black-900">
                  <Link
                    href={`/part/${item.slug}/${item.productId}`}
                    className="transition-colors hover:text-blue-300"
                  >
                    {productTitle(item)}
                  </Link>
                </h3>

                <span className="tnum shrink-0 whitespace-nowrap text-[14px] leading-[1.5] text-grey-600">
                  {formatDateShort(item.viewedAt)}
                </span>
              </li>
            ))}
          </ul>

          {data.pagesCount > 1 && (
            <Pagination
              current={page}
              total={data.pagesCount}
              hrefFor={(n) =>
                n > 1 ? `/account/history?page=${n}` : "/account/history"
              }
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-[16px] border border-grey-200 p-6">
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Тут зʼявляться деталі, які ви відкривали в каталозі.
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
