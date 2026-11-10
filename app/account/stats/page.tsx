import type { Metadata } from "next";
import { PeriodFilter } from "@/components/account/period-filter";
import { getPeriodStats } from "@/lib/api/order-items";
import { readPeriod } from "@/lib/period";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Статистика",
  robots: { index: false, follow: false },
};

export default async function StatsPage({
  searchParams,
}: PageProps<"/account/stats">) {
  const period = readPeriod(await searchParams);
  const stats = await getPeriodStats(period.from, period.to);

  /* Закупівля і продаж — дві ціни тієї самої позиції: `total` це те, що
     клієнт заплатив нам, `totalOut` — те, за що продав далі. Продажі й
     різницю показуємо лише коли відпускні ціни справді заведені, інакше
     різниця дорівнювала б мінус усій закупівлі й читалась як збиток. */
  const hasSales = stats.sales > 0;

  const figures = [
    {
      label: "Закупівлі через WestPart",
      value: formatMoney(stats.purchases),
      hint: "Сума позицій, які ви замовили за період",
    },
    ...(hasSales
      ? [
          {
            label: "Продажі",
            value: formatMoney(stats.sales),
            hint: "За вашими відпускними цінами",
          },
          {
            label: "Різниця",
            value: formatMoney(stats.margin),
            hint: "Продажі мінус закупівлі",
          },
        ]
      : []),
  ];

  const counts = [
    { label: "Замовлень", value: String(stats.ordersCount) },
    { label: "Позицій", value: String(stats.itemsCount) },
    { label: "Одиниць товару", value: `${stats.units} шт.` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900">
          Статистика
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Ваші закупівлі через WestPart за вибраний період. Якщо ви ведете
          відпускні ціни, поруч буде сума продажів і різниця між ними.
        </p>
      </div>

      <PeriodFilter action="/account/stats" period={period} />

      {stats.itemsCount === 0 ? (
        <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
          За період {formatDate(period.from)} — {formatDate(period.to)}{" "}
          замовлень немає. Спробуйте розширити межі.
        </p>
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-3">
            {figures.map(({ label, value, hint }) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-[16px] border border-grey-200 p-5"
              >
                <dt className="text-[14px] leading-[1.5] text-grey-600">
                  {label}
                </dt>
                <dd className="tnum text-[24px] font-semibold leading-[1.3] text-black-900">
                  {value}
                </dd>
                <p className="text-[13px] leading-[1.45] text-grey-600">
                  {hint}
                </p>
              </div>
            ))}
          </dl>

          <dl className="grid gap-4 sm:grid-cols-3">
            {counts.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 rounded-[16px] bg-grey-50 p-5"
              >
                <dt className="text-[14px] leading-[1.5] text-grey-600">
                  {label}
                </dt>
                <dd className="tnum text-[20px] font-semibold leading-[1.4] text-black-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-[14px] leading-[1.55] text-grey-700">
            Період: {formatDate(period.from)} — {formatDate(period.to)}.
          </p>

          {/* Якщо позицій за період більше, ніж ми вивантажуємо, цифри
              неповні — про це треба сказати, а не тихо показати менше */}
          {stats.truncated && (
            <p className="rounded-[12px] bg-yellow-50 px-4 py-3 text-[14px] leading-[1.55] text-black-900">
              За цей період позицій надто багато, тому суми пораховані не по
              всьому обсягу. Візьміть вужчий період — або попросіть менеджера
              вивантажити повний звіт.
            </p>
          )}
        </>
      )}
    </div>
  );
}
