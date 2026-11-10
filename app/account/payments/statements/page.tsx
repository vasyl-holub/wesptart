import type { Metadata } from "next";
import { PeriodFilter } from "@/components/account/period-filter";
import { OrderDocs } from "@/components/account/order-docs";
import { Pagination } from "@/components/ui/pagination";
import { getAccountRows } from "@/lib/api/accounts";
import { readPeriod } from "@/lib/period";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Виписки",
  robots: { index: false, follow: false },
};

const PER_PAGE = 25;

export default async function StatementsPage({
  searchParams,
}: PageProps<"/account/payments/statements">) {
  const sp = await searchParams;
  const period = readPeriod(sp);
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const rows = await getAccountRows({ ...period, page, perPage: PER_PAGE });

  /* Виписка — це той самий запис взаєморозрахунків, але тут нас цікавлять
     лише ті, для яких бекенд сформував документ */
  const docs = rows.items.filter((r) => r.printUrl || r.csvUrl);
  const query = `from=${period.from}&to=${period.to}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900">
          Виписки
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Документи по вашому рахунку за період: відкрийте для друку або
          вивантажте таблицею для своєї бухгалтерії.
        </p>
      </div>

      <PeriodFilter action="/account/payments/statements" period={period} />

      {docs.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {docs.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[16px] border border-grey-200 p-5"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[17px] font-semibold leading-[1.4] text-black-900">
                    {r.type || "Виписка"}
                    {r.number ? (
                      <span className="tnum font-normal text-grey-700">
                        {" "}
                        №{r.number}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[14px] leading-[1.5] text-grey-600">
                    {formatDate(r.date)}
                    {r.value !== null && ` · ${formatMoney(r.value)}`}
                  </span>
                </div>

                <OrderDocs printUrl={r.printUrl} csvUrl={r.csvUrl} />
              </li>
            ))}
          </ul>

          {rows.pagesCount > 1 && (
            <Pagination
              current={page}
              total={rows.pagesCount}
              hrefFor={(n) =>
                `/account/payments/statements?${query}${n > 1 ? `&page=${n}` : ""}`
              }
            />
          )}
        </>
      ) : (
        <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
          За вибраний період виписок немає. Спробуйте розширити межі або
          подивіться весь рух по рахунку у «Взаєморозрахунках».
        </p>
      )}
    </div>
  );
}
