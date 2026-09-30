"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import {
  createReturnAction,
  type AccountFormState,
} from "@/app/account/actions";
import type { StatusMap } from "@/lib/api/orders";

const EMPTY: AccountFormState = {};

export function ReturnForm({
  orderItemId,
  orderId,
  maxCount,
  reasons,
}: {
  orderItemId: string;
  orderId: string;
  maxCount: number;
  reasons: StatusMap;
}) {
  const [state, action, pending] = useActionState(createReturnAction, EMPTY);
  const [open, setOpen] = useState(false);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <p className="rounded-[8px] bg-green-50 px-4 py-3 text-[14px] leading-[1.5] text-green-300">
        Заявку на повернення створено. Статус — у розділі «Повернення».
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses({
          variant: "outline",
          size: "sm",
          className: "w-full sm:w-auto sm:self-start",
        })}
      >
        Оформити повернення
      </button>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-[12px] bg-grey-100 p-4"
      noValidate
    >
      <input type="hidden" name="orderItem" value={orderItemId} />
      <input type="hidden" name="order" value={orderId} />

      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[14px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
        <Field
          label="Причина"
          htmlFor={`reason-${orderItemId}`}
          error={err.reason}
          required
        >
          <Select
            id={`reason-${orderItemId}`}
            name="reason"
            defaultValue={v.reason ?? ""}
            invalid={Boolean(err.reason)}
          >
            <option value="">Оберіть причину</option>
            {Object.entries(reasons).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Кількість"
          htmlFor={`count-${orderItemId}`}
          error={err.count}
          required
        >
          <Input
            id={`count-${orderItemId}`}
            name="count"
            inputMode="numeric"
            max={maxCount}
            defaultValue={v.count ?? String(maxCount)}
            invalid={Boolean(err.count)}
          />
        </Field>
      </div>

      <Field
        label="Опис"
        htmlFor={`description-${orderItemId}`}
        error={err.description}
        hint="Що саме не так — це прискорить розгляд"
      >
        <Textarea
          id={`description-${orderItemId}`}
          name="description"
          rows={3}
          defaultValue={v.description ?? ""}
          invalid={Boolean(err.description)}
        />
      </Field>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "primary", size: "sm" })}
        >
          {pending ? "Надсилаємо…" : "Надіслати заявку"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
