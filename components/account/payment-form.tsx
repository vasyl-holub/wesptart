"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import {
  notifyPaymentAction,
  type AccountFormState,
} from "@/app/account/actions";
import type { UnpaidOrder } from "@/lib/api/payments";
import { formatMoney } from "@/lib/cn";

const EMPTY: AccountFormState = {};

export function PaymentForm({
  payMethods,
  unpaidOrders,
  today,
}: {
  payMethods: { id: string; name: string }[];
  unpaidOrders: UnpaidOrder[];
  /** Дата рахується на сервері, щоб не розійтися з часовим поясом клієнта */
  today: string;
}) {
  const [state, action, pending] = useActionState(notifyPaymentAction, EMPTY);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <p
        aria-live="polite"
        className="rounded-[8px] bg-green-50 px-4 py-3 text-[15px] leading-[1.5] text-green-300"
      >
        Дякуємо, менеджер отримав повідомлення й звірить надходження.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[15px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Дата оплати" htmlFor="date" error={err.date} required>
          <Input
            id="date"
            name="date"
            type="date"
            max={today}
            defaultValue={v.date ?? today}
            invalid={Boolean(err.date)}
          />
        </Field>

        <Field label="Сума, ₴" htmlFor="value" error={err.value} required>
          <Input
            id="value"
            name="value"
            inputMode="decimal"
            defaultValue={v.value}
            invalid={Boolean(err.value)}
            placeholder="4000"
          />
        </Field>

        <Field
          label="Спосіб"
          htmlFor="payMethod"
          error={err.payMethod}
          required
        >
          <Select
            id="payMethod"
            name="payMethod"
            defaultValue={v.payMethod ?? payMethods[0]?.id ?? ""}
            invalid={Boolean(err.payMethod)}
          >
            {payMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {unpaidOrders.length > 0 && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-1 text-[15px] font-medium leading-[1.5] text-black-900">
            За які замовлення
          </legend>
          <ul className="flex flex-col gap-2">
            {unpaidOrders.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-grey-200 px-4 py-3 transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    name="orders"
                    value={o.id}
                    className="size-4 accent-blue-300"
                  />
                  <span className="text-[15px] leading-[1.5] text-black-900">
                    №{o.number ?? o.id}
                  </span>
                  <span className="tnum ml-auto text-[15px] leading-[1.5] text-grey-700">
                    {o.total === null ? "—" : formatMoney(o.total)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <Field
        label="Коментар"
        htmlFor="comment"
        error={err.comment}
        hint="Номер платіжки, від кого платили — якщо це не збігається з акаунтом"
      >
        <Textarea
          id="comment"
          name="comment"
          rows={3}
          defaultValue={v.comment}
          invalid={Boolean(err.comment)}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({
          variant: "primary",
          className: "w-full sm:w-auto sm:self-start",
        })}
      >
        {pending ? "Надсилаємо…" : "Повідомити про оплату"}
      </button>
    </form>
  );
}
