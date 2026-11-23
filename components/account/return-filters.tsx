import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import type { StatusMap } from "@/lib/api/orders";

/**
 * Фільтри списку повернень — ті самі, що були в старому кабінеті на
 * /returns/: номер замовлення, причина, реакція, опис, товар, номер
 * документа, інформація про відправку й межі дати створення.
 *
 * Звичайна GET-форма, як і у замовленнях: умови лишаються в адресі, їх
 * можна переслати менеджеру, і вони працюють без скриптів.
 */
export type ReturnFilterValues = {
  order: string;
  doc: string;
  reason: string;
  reaction: string;
  description: string;
  dispatch: string;
  product: string;
  article: string;
  cfrom: string;
  cto: string;
};

export function ReturnFilters({
  values,
  reasons,
  reactions,
  applied,
}: {
  values: ReturnFilterValues;
  reasons: StatusMap;
  reactions: StatusMap;
  /** Скільки умов задано — щоб показати кнопку скидання */
  applied: number;
}) {
  return (
    <form
      method="get"
      action="/account/returns"
      className="flex flex-col gap-5 rounded-[16px] border border-grey-200 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="№ замовлення" htmlFor="r-order">
          <Input
            id="r-order"
            name="order"
            inputMode="numeric"
            defaultValue={values.order}
            placeholder="Наприклад, 139204"
          />
        </Field>

        <Field label="Товар" htmlFor="r-product">
          <Input
            id="r-product"
            name="product"
            defaultValue={values.product}
            placeholder="Сайлентблок"
          />
        </Field>

        {/* Назва й артикул — різні фільтри бекенду: по `product` артикул
            не знаходиться, тому поле окреме */}
        <Field label="Артикул" htmlFor="r-article">
          <Input
            id="r-article"
            name="article"
            defaultValue={values.article}
            placeholder="ZTPDW080DF"
          />
        </Field>

        <Field label="№ документа" htmlFor="r-doc">
          <Input
            id="r-doc"
            name="doc"
            inputMode="numeric"
            defaultValue={values.doc}
          />
        </Field>

        <Field label="Причина повернення" htmlFor="r-reason">
          <Select id="r-reason" name="reason" defaultValue={values.reason}>
            <option value="">Усі</option>
            {Object.entries(reasons).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Рішення" htmlFor="r-reaction">
          <Select
            id="r-reaction"
            name="reaction"
            defaultValue={values.reaction}
          >
            <option value="">Усі</option>
            {Object.entries(reactions).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Опис" htmlFor="r-description">
          <Input
            id="r-description"
            name="description"
            defaultValue={values.description}
            placeholder="Текст із заявки"
          />
        </Field>

        <Field label="Інформація про відправку" htmlFor="r-dispatch">
          <Input
            id="r-dispatch"
            name="dispatch"
            defaultValue={values.dispatch}
            placeholder="ТТН або перевізник"
          />
        </Field>

        <Field label="Створено від" htmlFor="r-cfrom">
          <Input
            id="r-cfrom"
            name="cfrom"
            type="date"
            defaultValue={values.cfrom}
          />
        </Field>

        <Field label="Створено до" htmlFor="r-cto">
          <Input id="r-cto" name="cto" type="date" defaultValue={values.cto} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClasses({ variant: "primary" })}>
          Застосувати
        </button>

        {applied > 0 && (
          <Link
            href="/account/returns"
            className={buttonClasses({ variant: "outline" })}
          >
            Скинути
          </Link>
        )}
      </div>
    </form>
  );
}
