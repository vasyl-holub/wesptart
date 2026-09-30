import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/account/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import { getReturns, getReturnDictionaries } from "@/lib/api/orders";
import { formatDate } from "@/lib/format-date";
import type { StatusTone } from "@/lib/api/orders";

export const metadata: Metadata = {
  title: "Повернення",
  robots: { index: false, follow: false },
};

const PER_PAGE = 10;

/* Рішення менеджера: 0 відхилено, 1 схвалено, 2 уточнюйте */
const reactionTone: Record<string, StatusTone> = {
  "0": "failed",
  "1": "done",
  "2": "waiting",
};

export default async function ReturnsPage({
  searchParams,
}: PageProps<"/account/returns">) {
  const sp = await searchParams;
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const [data, dict] = await Promise.all([
    getReturns(page, PER_PAGE),
    getReturnDictionaries(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Повернення
        </h2>
        <span className="tnum text-[15px] leading-[1.5] text-grey-700">
          Знайдено: {data.totalCount}
        </span>
      </div>

      {data.items.length ? (
        <>
          <ul className="flex flex-col gap-4">
            {data.items.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <h3 className="min-w-0 text-[16px] font-semibold leading-[1.5] text-black-900">
                    {r.product ? (
                      <Link
                        href={`/part/${r.product.slug}/${r.product.id}`}
                        className="transition-colors hover:text-blue-300"
                      >
                        {[r.product.name, r.product.num]
                          .filter(Boolean)
                          .join(", ")}
                      </Link>
                    ) : (
                      "Позицію видалено з каталогу"
                    )}
                  </h3>

                  {/* reaction null означає, що менеджер ще не дивився заявку */}
                  <StatusBadge
                    label={
                      r.reaction === null
                        ? "на розгляді"
                        : (dict.reactions[String(r.reaction)] ?? "—")
                    }
                    tone={
                      r.reaction === null
                        ? "progress"
                        : (reactionTone[String(r.reaction)] ?? "neutral")
                    }
                  />
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Причина
                    </dt>
                    <dd className="text-[15px] leading-[1.5] text-black-900">
                      {dict.reasons[String(r.reason)] ?? "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Кількість
                    </dt>
                    <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                      {r.count} шт.
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Створено
                    </dt>
                    <dd className="text-[15px] leading-[1.5] text-black-900">
                      {formatDate(r.created)}
                    </dd>
                  </div>
                </dl>

                {r.description && (
                  <p className="text-[14px] leading-[1.5] text-grey-700">
                    {r.description}
                  </p>
                )}

                {/* Коментар менеджера — головне, заради чого сюди заходять */}
                {r.comment && (
                  <p className="rounded-[12px] bg-blue-25 px-4 py-3 text-[14px] leading-[1.5] text-grey-700">
                    Відповідь: {r.comment}
                  </p>
                )}

                {r.dispatchInfo && (
                  <p className="text-[14px] leading-[1.5] text-grey-700">
                    Відправлення: {r.dispatchInfo}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {data.pagesCount > 1 && (
            <Pagination
              current={page}
              total={data.pagesCount}
              hrefFor={(n) =>
                n > 1 ? `/account/returns?page=${n}` : "/account/returns"
              }
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-[16px] border border-grey-200 p-6">
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Повернень поки немає. Оформити його можна в деталях замовлення —
            біля потрібної позиції.
          </p>
          <Link
            href="/account/orders"
            className={buttonClasses({ variant: "primary" })}
          >
            До замовлень
          </Link>
        </div>
      )}
    </div>
  );
}
