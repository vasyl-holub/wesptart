import type { Metadata } from "next";
import Link from "next/link";
import {
  ItemFilters,
  type ItemFilterValues,
} from "@/components/account/item-filters";
import { StatusBadge } from "@/components/account/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { getOrderedItems } from "@/lib/api/order-items";
import { getOrderStatuses, itemTone } from "@/lib/api/orders";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Замовлені позиції",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

const KEYS = ["article", "name", "order", "status", "from", "to"] as const;

export default async function OrderedItemsPage({
  searchParams,
}: PageProps<"/account/orders/items">) {
  const sp = await searchParams;
  const one = (key: string) => {
    const v = sp[key];
    return typeof v === "string" ? v : "";
  };

  const values = Object.fromEntries(
    KEYS.map((k) => [k, one(k)]),
  ) as ItemFilterValues;

  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const digits = values.order.replace(/\D/g, "");

  const [list, statuses] = await Promise.all([
    getOrderedItems(page, PER_PAGE, {
      article: values.article,
      name: values.name,
      orderNumber: digits ? Number(digits) : undefined,
      statuses: values.status ? [values.status] : undefined,
      from: values.from || undefined,
      to: values.to || undefined,
    }),
    getOrderStatuses(),
  ]);

  const applied = KEYS.filter((k) => values[k]).length;

  /* Фільтри тягнемо за собою в пагінацію, інакше друга сторінка показувала б
     зовсім інший список */
  const query = KEYS.filter((k) => values[k])
    .map((k) => `${k}=${encodeURIComponent(values[k])}`)
    .join("&");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900">
          Замовлені позиції
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Усі запчастини, які ви замовляли, одним списком — наскрізно по всіх
          замовленнях. Зручно, коли треба знайти конкретний артикул і не
          пам&apos;ятаєте, в якому замовленні він був.
        </p>
      </div>

      <ItemFilters values={values} statuses={statuses.item} applied={applied} />

      {list.items.length ? (
        <>
          <p className="tnum text-[15px] leading-[1.5] text-grey-700">
            Знайдено: {list.totalCount}
          </p>

          <ul className="flex flex-col gap-3">
            {list.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="flex flex-col gap-0.5">
                    {item.product ? (
                      <Link
                        href={`/part/${item.product.slug}/${item.product.id}`}
                        className="text-[17px] font-semibold leading-[1.4] text-black-900 transition-colors hover:text-blue-300"
                      >
                        {item.product.name}
                      </Link>
                    ) : (
                      <span className="text-[17px] font-semibold leading-[1.4] text-grey-700">
                        Товар недоступний
                      </span>
                    )}
                    {item.product && (
                      <span className="text-[14px] leading-[1.5] text-grey-600">
                        {[item.product.brand, item.product.num]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </div>

                  <StatusBadge
                    label={
                      statuses.item[String(item.status)] ?? "невідомий статус"
                    }
                    tone={itemTone(item.status)}
                  />
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Замовлення
                    </dt>
                    <dd className="text-[15px] leading-[1.5]">
                      {item.order ? (
                        <Link
                          href={`/account/orders/${item.order.id}`}
                          className="tnum font-semibold text-blue-300 transition-opacity hover:opacity-80"
                        >
                          №{item.order.number ?? item.order.id}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Замовлено
                    </dt>
                    <dd className="text-[15px] leading-[1.5] text-black-900">
                      {item.order ? formatDate(item.order.created) : "—"}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Кількість
                    </dt>
                    <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                      {item.count} шт.
                    </dd>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Сума
                    </dt>
                    <dd className="tnum text-[15px] font-semibold leading-[1.5] text-black-900">
                      {item.total === null ? "—" : formatMoney(item.total)}
                    </dd>
                  </div>
                </dl>

                {/* Очікувана дата приходу — те, через що в цей список і
                    заходять, коли позиція ще в дорозі */}
                {item.arrival && (
                  <p className="text-[14px] leading-[1.5] text-grey-700">
                    Очікуємо:{" "}
                    <span className="font-medium text-black-900">
                      {formatDate(item.arrival)}
                    </span>
                  </p>
                )}

                {item.comment && (
                  <p className="text-[14px] leading-[1.5] text-grey-700">
                    {item.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {list.pagesCount > 1 && (
            <Pagination
              current={page}
              total={list.pagesCount}
              hrefFor={(n) => {
                const parts = [query, n > 1 ? `page=${n}` : ""].filter(Boolean);
                return parts.length
                  ? `/account/orders/items?${parts.join("&")}`
                  : "/account/orders/items";
              }}
            />
          )}
        </>
      ) : (
        <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
          {applied > 0
            ? "За такими умовами позицій немає. Спробуйте зняти частину фільтрів."
            : "Ви ще нічого не замовляли."}
        </p>
      )}
    </div>
  );
}
