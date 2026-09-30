"use client";

import { useActionState, useState } from "react";
import { Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import {
  addOrderCommentAction,
  cancelOrderAction,
  type AccountFormState,
} from "@/app/account/actions";

const EMPTY: AccountFormState = {};

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(cancelOrderAction, EMPTY);
  /* Скасування незворотне, тому питаємо підтвердження прямо в інтерфейсі,
     а не системним confirm() — його блокують частина браузерів */
  const [confirming, setConfirming] = useState(false);

  if (state.ok) {
    return (
      <p className="rounded-[8px] bg-grey-100 px-4 py-3 text-[14px] leading-[1.5] text-grey-700">
        Замовлення скасовано.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[14px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      {confirming ? (
        <form action={action} className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="order" value={orderId} />
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[8px] bg-danger-700 px-4 text-[14px] font-semibold leading-[1.5] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Скасовуємо…" : "Так, скасувати"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            Передумав
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="h-10 w-fit rounded-[8px] px-3 text-[14px] leading-[1.5] text-grey-700 transition-colors hover:bg-danger-50 hover:text-danger-700"
        >
          Скасувати замовлення
        </button>
      )}
    </div>
  );
}

export function OrderCommentForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(addOrderCommentAction, EMPTY);
  const err = state.fieldErrors ?? {};

  return (
    <form
      key={state.ok ? "sent" : "draft"}
      action={action}
      className="flex flex-col gap-3"
      noValidate
    >
      <input type="hidden" name="order" value={orderId} />

      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[14px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      {state.ok && (
        <p
          aria-live="polite"
          className="rounded-[8px] bg-green-50 px-4 py-3 text-[14px] leading-[1.5] text-green-300"
        >
          Повідомлення надіслано менеджеру
        </p>
      )}

      <Textarea
        name="text"
        rows={3}
        invalid={Boolean(err.text)}
        placeholder="Питання щодо замовлення — менеджер побачить його разом із замовленням"
        aria-label="Повідомлення менеджеру"
      />
      {err.text && (
        <p role="alert" className="text-[12.5px] leading-[1.4] text-danger-700">
          {err.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({
          variant: "outline",
          size: "sm",
          className: "w-full sm:w-auto sm:self-start",
        })}
      >
        {pending ? "Надсилаємо…" : "Надіслати менеджеру"}
      </button>
    </form>
  );
}
