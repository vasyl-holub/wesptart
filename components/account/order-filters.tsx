import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import type { StatusMap } from "@/lib/api/orders";

/**
 * Фільтри списку замовлень.
 *
 * Звичайна GET-форма, а не клієнтський компонент: фільтри лишаються в
 * адресі, їх можна зберегти в закладки чи переслати менеджеру, і вони
 * працюють навіть коли скрипти не завантажились.
 */

/** Готові набори статусів — те саме, що раніше було вкладками */
export const STATUS_PRESETS = [
  { value: "1,2,12,5,6,8,9,10,11", label: "В роботі" },
  { value: "3", label: "Завершені" },
  { value: "4", label: "Скасовані" },
];

export type OrderFilterValues = {
  number: string;
  article: string;
  ttn: string;
  status: string;
  cfrom: string;
  cto: string;
  sfrom: string;
  sto: string;
};

export function OrderFilters({
  values,
  statuses,
  applied,
}: {
  values: OrderFilterValues;
  statuses: StatusMap;
  /** Скільки фільтрів справді задано — щоб показати кнопку скидання */
  applied: number;
}) {
  return (
    <form
      method="get"
      action="/account/orders"
      className="flex flex-col gap-5 rounded-[16px] border border-grey-200 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="№ замовлення" htmlFor="f-number">
          <Input
            id="f-number"
            name="number"
            inputMode="numeric"
            defaultValue={values.number}
            placeholder="Наприклад, 125430"
          />
        </Field>

        <Field label="Артикул запчастини" htmlFor="f-article">
          <Input
            id="f-article"
            name="article"
            defaultValue={values.article}
            placeholder="45X203"
          />
        </Field>

        <Field label="Номер ТТН" htmlFor="f-ttn">
          <Input
            id="f-ttn"
            name="ttn"
            inputMode="numeric"
            defaultValue={values.ttn}
            placeholder="20450123456789"
          />
        </Field>

        <Field label="Статус" htmlFor="f-status">
          <Select id="f-status" name="status" defaultValue={values.status}>
            <option value="">Усі</option>
            <optgroup label="Групи">
              {STATUS_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Окремі статуси">
              {Object.entries(statuses).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </optgroup>
          </Select>
        </Field>

        <Field label="Створено від" htmlFor="f-cfrom">
          <Input
            id="f-cfrom"
            name="cfrom"
            type="date"
            defaultValue={values.cfrom}
          />
        </Field>

        <Field label="Створено до" htmlFor="f-cto">
          <Input id="f-cto" name="cto" type="date" defaultValue={values.cto} />
        </Field>

        <Field label="Відправлено від" htmlFor="f-sfrom">
          <Input
            id="f-sfrom"
            name="sfrom"
            type="date"
            defaultValue={values.sfrom}
          />
        </Field>

        <Field label="Відправлено до" htmlFor="f-sto">
          <Input id="f-sto" name="sto" type="date" defaultValue={values.sto} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClasses({ variant: "primary" })}>
          Застосувати
        </button>

        {applied > 0 && (
          <Link
            href="/account/orders"
            className={buttonClasses({ variant: "outline" })}
          >
            Скинути
          </Link>
        )}
      </div>
    </form>
  );
}
