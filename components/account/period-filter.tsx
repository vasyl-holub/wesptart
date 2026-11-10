import Link from "next/link";
import { Field, Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  PERIOD_PRESETS,
  isPreset,
  presetPeriod,
  type Period,
} from "@/lib/period";

/**
 * Вибір періоду. Як і фільтри замовлень — звичайна GET-форма, тому межі
 * лишаються в адресі й сторінку можна переслати чи зберегти в закладки.
 */
export function PeriodFilter({
  action,
  period,
  children,
}: {
  /** Адреса розділу, який читає ці межі */
  action: string;
  period: Period;
  /** Додаткові поля розділу, якщо вони в нього є */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-grey-200 p-5">
      {/* Готові періоди окремими посиланнями: за ними тягнуться найчастіше,
          і так до них один клік, а не два поля */}
      <div className="flex flex-wrap gap-2">
        {PERIOD_PRESETS.map(({ days, label }) => {
          const p = presetPeriod(days);
          const active = isPreset(period, days);
          return (
            <Link
              key={days}
              href={`${action}?from=${p.from}&to=${p.to}`}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold leading-[1.5] transition-colors",
                active
                  ? "bg-blue-300 text-white"
                  : "border border-grey-200 text-grey-700 hover:border-blue-300 hover:text-blue-300",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <form
        method="get"
        action={action}
        className="flex flex-col gap-4 border-t border-grey-200 pt-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Період від" htmlFor="p-from">
            <Input
              id="p-from"
              name="from"
              type="date"
              defaultValue={period.from}
            />
          </Field>
          <Field label="до" htmlFor="p-to">
            <Input id="p-to" name="to" type="date" defaultValue={period.to} />
          </Field>
          {children}
        </div>

        <div>
          <button
            type="submit"
            className={buttonClasses({ size: "sm", className: "px-6" })}
          >
            Показати
          </button>
        </div>
      </form>
    </div>
  );
}
