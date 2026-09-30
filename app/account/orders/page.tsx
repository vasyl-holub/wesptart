import type { Metadata } from "next";
import Link from "next/link";
import { OrderCard } from "@/components/account/order-card";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getOrders, getOrderStatuses } from "@/lib/api/orders";

export const metadata: Metadata = {
  title: "Мої замовлення",
  robots: { index: false, follow: false },
};

const PER_PAGE = 10;

/** Коди беремо з orderStatuses: 3 завершено, 4 скасовано, решта в роботі */
const filters = [
  { key: "", label: "Усі", statuses: undefined },
  {
    key: "active",
    label: "В роботі",
    statuses: ["1", "2", "12", "5", "6", "8", "9", "10", "11"],
  },
  { key: "done", label: "Завершені", statuses: ["3"] },
  { key: "canceled", label: "Скасовані", statuses: ["4"] },
] as const;

export default async function OrdersPage({
  searchParams,
}: PageProps<"/account/orders">) {
  const sp = await searchParams;

  const rawPage = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const key = typeof sp.status === "string" ? sp.status : "";
  const active = filters.find((f) => f.key === key) ?? filters[0];

  const [data, statuses] = await Promise.all([
    getOrders(
      page,
      PER_PAGE,
      active.statuses ? [...active.statuses] : undefined,
    ),
    getOrderStatuses(),
  ]);

  const hrefFor = (n: number) => {
    const params = new URLSearchParams();
    if (active.key) params.set("status", active.key);
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

      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {filters.map((f) => (
          <li key={f.key || "all"}>
            <Link
              href={
                f.key ? `/account/orders?status=${f.key}` : "/account/orders"
              }
              aria-current={f.key === active.key ? "page" : undefined}
              className={cn(
                "flex h-10 items-center whitespace-nowrap rounded-[8px] px-4 text-[15px] leading-[1.5] transition-colors",
                f.key === active.key
                  ? "bg-blue-300 font-semibold text-white"
                  : "bg-grey-100 text-grey-700 hover:bg-blue-25 hover:text-blue-300",
              )}
            >
              {f.label}
            </Link>
          </li>
        ))}
      </ul>

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
            {active.key
              ? "У цьому розділі замовлень немає."
              : "Замовлень поки немає."}
          </p>
          <Link
            href={active.key ? "/account/orders" : "/catalog"}
            className={buttonClasses({ variant: "primary" })}
          >
            {active.key ? "Показати всі" : "До каталогу"}
          </Link>
        </div>
      )}
    </div>
  );
}
