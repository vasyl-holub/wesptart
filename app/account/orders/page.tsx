import type { Metadata } from "next";
import Link from "next/link";
import { OrderCard } from "@/components/account/order-card";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import {
  OrderFilters,
  type OrderFilterValues,
} from "@/components/account/order-filters";
import { getOrders, getOrderStatuses } from "@/lib/api/orders";

export const metadata: Metadata = {
  title: "Мої замовлення",
  robots: { index: false, follow: false },
};

const PER_PAGE = 10;

/** Поля фільтра, які приходять з адреси як звичайний текст */
const TEXT_KEYS = [
  "number",
  "article",
  "ttn",
  "status",
  "cfrom",
  "cto",
  "sfrom",
  "sto",
] as const;

function readValues(sp: Record<string, string | string[] | undefined>) {
  const out = {} as OrderFilterValues;
  for (const key of TEXT_KEYS) {
    const raw = sp[key];
    out[key] = (typeof raw === "string" ? raw : "").trim();
  }
  return out;
}

export default async function OrdersPage({
  searchParams,
}: PageProps<"/account/orders">) {
  const sp = await searchParams;
  const values = readValues(sp);

  const rawPage = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  /* Номер приймаємо тільки цифрами: бекенд чекає Decimal і на тексті
     віддає помилку замість порожнього списку */
  const digits = values.number.replace(/\D/g, "");

  const [data, statuses] = await Promise.all([
    getOrders(page, PER_PAGE, {
      number: digits ? Number(digits) : undefined,
      statuses: values.status ? values.status.split(",") : undefined,
      article: values.article,
      declaration: values.ttn,
      createdFrom: values.cfrom,
      createdTo: values.cto,
      shippedFrom: values.sfrom,
      shippedTo: values.sto,
    }),
    getOrderStatuses(),
  ]);

  const applied = TEXT_KEYS.filter((k) => values[k]).length;

  const hrefFor = (n: number) => {
    const params = new URLSearchParams();
    for (const key of TEXT_KEYS) {
      if (values[key]) params.set(key, values[key]);
    }
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/account/orders?${qs}` : "/account/orders";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Мої замовлення
        </h2>
        <span className="tnum text-[15px] leading-[1.5] text-grey-700">
          Знайдено: {data.totalCount}
        </span>
      </div>

      <OrderFilters
        values={values}
        statuses={statuses.order}
        applied={applied}
      />

      {data.items.length ? (
        <>
          <ul className="flex flex-col gap-4">
            {data.items.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} statuses={statuses.order} />
              </li>
            ))}
          </ul>

          {data.pagesCount > 1 && (
            <Pagination
              current={page}
              total={data.pagesCount}
              hrefFor={hrefFor}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-[16px] border border-grey-200 p-6">
          <p className="text-[16px] leading-[1.6] text-grey-700">
            {applied
              ? "За цими умовами замовлень не знайдено. Спробуйте прибрати частину фільтрів."
              : "Замовлень поки немає."}
          </p>
          <Link
            href={applied ? "/account/orders" : "/catalog"}
            className={buttonClasses({ variant: "primary" })}
          >
            {applied ? "Скинути фільтри" : "До каталогу"}
          </Link>
        </div>
      )}
    </div>
  );
}
