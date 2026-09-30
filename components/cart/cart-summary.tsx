import Link from "next/link";
import { ClockIcon, ShieldCheckIcon, TruckIcon } from "@/components/ui/icons";
import { formatMoney } from "@/lib/cn";
import { site } from "@/lib/site";

export function CartSummary({
  positions,
  units,
  total,
}: {
  positions: number;
  units: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-5 rounded-[24px] border border-grey-200 bg-white p-5 sm:p-6">
        <h2 className="text-[20px] font-semibold leading-[1.5] text-black-900">
          Разом
        </h2>

        <dl className="flex flex-col gap-3 text-[16px] leading-[1.5]">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-grey-700">Позицій</dt>
            <dd className="tnum font-semibold text-black-900">{positions}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-grey-700">Одиниць</dt>
            <dd className="tnum font-semibold text-black-900">{units}</dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between gap-4 border-t border-grey-200 pt-4">
          <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
            До сплати
          </span>
          <span className="tnum whitespace-nowrap text-[24px] font-semibold leading-[1.5] text-blue-300">
            {formatMoney(total)}
          </span>
        </div>

        {/* Вартість доставки рахує перевізник — не вигадуємо її в кошику */}
        <p className="flex gap-2.5 text-[14px] leading-[1.5] text-grey-700">
          <TruckIcon className="size-5 shrink-0 text-blue-300" />
          Вартість доставки рахується під час оформлення — залежить від
          перевізника й міста.
        </p>

        <Link
          href="/checkout"
          className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
        >
          Оформити замовлення
        </Link>

        <p className="flex gap-2.5 text-[14px] leading-[1.5] text-grey-700">
          <ClockIcon className="size-5 shrink-0 text-blue-300" />
          Замовлення, підтверджені в робочі години ({site.workingHours}),
          потрапляють у найближчу відправку.
        </p>
      </div>

      <div className="flex gap-3 rounded-[24px] border border-grey-200 bg-white p-5">
        <ShieldCheckIcon className="size-6 shrink-0 text-green-300" />
        <p className="text-[14px] leading-[1.5] text-grey-700">
          <span className="font-semibold text-black-900">
            Гарантія й повернення.
          </span>{" "}
          Якщо деталь не підійшла — приймаємо назад протягом 14 днів у товарному
          вигляді.
        </p>
      </div>
    </div>
  );
}
