"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import {
  notifyPaymentAction,
  type AccountFormState,
} from "@/app/account/actions";

const EMPTY: AccountFormState = {};

export function PaymentForm({
  payMethods,
  today,
}: {
  payMethods: { id: string; name: string }[];
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

      <Field
        label="Коментар"
        htmlFor="comment"
        error={err.comment}
        hint="Номер платіжки, за які замовлення, від кого платили"
        /* Перелік несплачених замовлень зі списком-галочками замовник
           прибрав: у B2B платять загальну суму, а не вибрані рахунки.
           Якщо платіж стосується конкретних замовлень — про це пишуть
           тут, і менеджер розносить його сам. */
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
