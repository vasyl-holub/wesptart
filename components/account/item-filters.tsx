import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import type { StatusMap } from "@/lib/api/orders";

/**
 * Фільтри наскрізного списку позицій. Як і у замовленнях — GET-форма, щоб
 * вибірку можна було зберегти в закладки або переслати менеджеру.
 */

export type ItemFilterValues = {
  article: string;
  name: string;
  order: string;
  status: string;
  from: string;
  to: string;
};

export function ItemFilters({
  values,
  statuses,
  applied,
}: {
  values: ItemFilterValues;
  statuses: StatusMap;
  /** Скільки фільтрів справді задано — щоб показати кнопку скидання */
  applied: number;
}) {
  return (
    <form
      method="get"
      action="/account/orders/items"
      className="flex flex-col gap-5 rounded-[16px] border border-grey-200 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Артикул запчастини" htmlFor="i-article">
          <Input
            id="i-article"
            name="article"
            defaultValue={values.article}
            placeholder="Наприклад, EZCRE027"
          />
        </Field>

        <Field label="Назва товару" htmlFor="i-name">
          <Input
            id="i-name"
            name="name"
            defaultValue={values.name}
            placeholder="Частина назви"
          />
        </Field>

        <Field label="№ замовлення" htmlFor="i-order">
          <Input
            id="i-order"
            name="order"
            inputMode="numeric"
            defaultValue={values.order}
            placeholder="Наприклад, 125430"
          />
        </Field>

        <Field label="Статус позиції" htmlFor="i-status">
          <Select id="i-status" name="status" defaultValue={values.status}>
            <option value="">Будь-який</option>
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Замовлено від" htmlFor="i-from">
          <Input
            id="i-from"
            name="from"
            type="date"
            defaultValue={values.from}
          />
        </Field>

        <Field label="до" htmlFor="i-to">
          <Input id="i-to" name="to" type="date" defaultValue={values.to} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className={buttonClasses({ size: "sm", className: "px-6" })}
        >
          Застосувати
        </button>

        {applied > 0 && (
          <Link
            href="/account/orders/items"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            Скинути
          </Link>
        )}
      </div>
    </form>
  );
}
