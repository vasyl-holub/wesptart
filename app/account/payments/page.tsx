import type { Metadata } from "next";
import { PeriodFilter } from "@/components/account/period-filter";
import { OrderDocs } from "@/components/account/order-docs";
import { Pagination } from "@/components/ui/pagination";
import { getAccountRows } from "@/lib/api/accounts";
import { getProfile } from "@/lib/api/account";
import { readPeriod } from "@/lib/period";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/cn";
import { pluralize } from "@/lib/plural";

export const metadata: Metadata = {
  title: "Взаєморозрахунки",
  robots: { index: false, follow: false },
};

const PER_PAGE = 25;

export default async function MutualSettlementsPage({
  searchParams,
}: PageProps<"/account/payments">) {
  const sp = await searchParams;
  const period = readPeriod(sp);
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const [rows, profile] = await Promise.all([
    getAccountRows({ ...period, page, perPage: PER_PAGE }),
    getProfile(),
  ]);

  const query = `from=${period.from}&to=${period.to}`;

  const totals = [
    { label: "Баланс", value: profile?.balance ?? 0 },
    { label: "До оплати", value: profile?.debt ?? 0 },
    { label: "Кредитний ліміт", value: profile?.balanceLimit ?? 0 },
  ].filter((t) => t.value !== 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900">
          Взаєморозрахунки
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Рух по вашому рахунку: замовлення, оплати й повернення в одному
          списку. Кожен рядок можна відкрити для друку або вивантажити.
        </p>
      </div>

      {/* Поточні цифри — з профілю: вони не залежать від вибраного періоду,
          тому стоять над фільтром, а не в підсумку таблиці */}
      {totals.length > 0 && (
        <dl className="grid gap-4 sm:grid-cols-3">
          {totals.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-[16px] border border-grey-200 p-5"
            >
              <dt className="text-[14px] leading-[1.5] text-grey-600">
                {label}
              </dt>
              <dd className="tnum text-[20px] font-semibold leading-[1.4] text-black-900">
                {formatMoney(value)}
              </dd>
            </div>
          ))}
          {profile?.creditDays ? (
            <div className="flex flex-col gap-1 rounded-[16px] border border-grey-200 p-5">
              <dt className="text-[14px] leading-[1.5] text-grey-600">
                Відстрочка
              </dt>
              <dd className="text-[20px] font-semibold leading-[1.4] text-black-900">
                {pluralize(profile.creditDays, "день", "дні", "днів")}
              </dd>
            </div>
          ) : null}
        </dl>
      )}

      <PeriodFilter action="/account/payments" period={period} />

      {rows.items.length ? (
        <>
          {/* На телефоні таблиця з шести колонок перетворювалась на
              горизонтальну прокрутку — там показуємо ті самі дані
              картками, а таблицю лишаємо для широкого екрана */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {rows.items.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-[16px] font-semibold leading-[1.4] text-black-900">
                    {r.type || "Операція"}
                    {r.number ? (
                      <span className="tnum font-normal text-grey-700">
                        {" "}
                        №{r.number}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[14px] leading-[1.5] text-grey-600">
                    {formatDate(r.date)}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Сума
                    </dt>
                    <dd className="tnum text-[15px] font-semibold leading-[1.5] text-black-900">
                      {r.value === null
                        ? (r.sourceValue ?? "—")
                        : formatMoney(r.value)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[13px] leading-[1.45] text-grey-600">
                      Залишок
                    </dt>
                    <dd className="tnum text-[15px] leading-[1.5] text-grey-700">
                      {r.balance ?? "—"}
                    </dd>
                  </div>
                </dl>

                {r.orders ? (
                  <p className="text-[13px] leading-[1.45] text-grey-600">
                    {pluralize(
                      r.orders,
                      "замовлення",
                      "замовлення",
                      "замовлень",
                    )}
                  </p>
                ) : null}

                <OrderDocs printUrl={r.printUrl} csvUrl={r.csvUrl} compact />
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-[16px] border border-grey-200 lg:block">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-50">
                  {["Дата", "Операція", "№", "Сума", "Залишок", ""].map(
                    (h, i) => (
                      <th
                        key={h || i}
                        scope="col"
                        className="px-4 py-3 text-[13px] font-semibold leading-[1.45] text-grey-600"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.items.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-grey-200 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-[15px] leading-[1.5] text-black-900">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-3 text-[15px] leading-[1.5] text-black-900">
                      {r.type || "—"}
                      {r.orders ? (
                        <span className="block text-[13px] leading-[1.45] text-grey-600">
                          {pluralize(
                            r.orders,
                            "замовлення",
                            "замовлення",
                            "замовлень",
                          )}
                        </span>
                      ) : null}
                    </td>
                    <td className="tnum px-4 py-3 text-[15px] leading-[1.5] text-black-900">
                      {r.number ?? "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-[15px] font-semibold leading-[1.5] text-black-900">
                      {r.value === null
                        ? (r.sourceValue ?? "—")
                        : formatMoney(r.value)}
                    </td>
                    <td className="tnum px-4 py-3 text-[15px] leading-[1.5] text-grey-700">
                      {r.balance ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <OrderDocs
                        printUrl={r.printUrl}
                        csvUrl={r.csvUrl}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.pagesCount > 1 && (
            <Pagination
              current={page}
              total={rows.pagesCount}
              hrefFor={(n) =>
                `/account/payments?${query}${n > 1 ? `&page=${n}` : ""}`
              }
            />
          )}
        </>
      ) : (
        <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
          За вибраний період рухів по рахунку немає. Спробуйте розширити межі.
        </p>
      )}
    </div>
  );
}
