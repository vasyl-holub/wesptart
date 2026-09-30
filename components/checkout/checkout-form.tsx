"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheckIcon } from "@/components/ui/icons";
import { createOrderAction, type CheckoutState } from "@/app/checkout/actions";
import type { OrderOption } from "@/lib/api/cart";

const field =
  "h-12 w-full rounded-[8px] border border-grey-300 bg-white px-4 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:border-blue-300 focus:outline-none";
const errorText = "text-[13px] leading-[1.4] text-danger-500";

function Radios({
  name,
  title,
  options,
  defaultValue,
  error,
}: {
  name: string;
  title: string;
  options: OrderOption[];
  defaultValue?: string;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[18px] font-semibold leading-[1.4] text-black-900">
        {title}
      </legend>

      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <label
            key={o.id}
            className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-grey-200 px-5 py-4 transition-colors has-checked:border-blue-300 has-checked:bg-blue-25"
          >
            <input
              type="radio"
              name={name}
              value={o.id}
              defaultChecked={defaultValue === o.id}
              className="size-4 accent-blue-300"
            />
            <span className="text-[15px] leading-[1.5] text-black-900">
              {o.name}
            </span>
          </label>
        ))}
      </div>

      {error && <p className={errorText}>{error}</p>}
    </fieldset>
  );
}

export function CheckoutForm({
  deliveries,
  payMethods,
}: {
  deliveries: OrderOption[];
  payMethods: OrderOption[];
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    createOrderAction,
    {},
  );

  if (state.orderNumber) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-green-300/25 bg-white p-8 text-center">
        <CircleCheckIcon className="size-10 text-green-300" />
        <p className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Замовлення № {state.orderNumber} прийнято
        </p>
        <p className="max-w-[460px] text-[15px] leading-[1.55] text-grey-700">
          Менеджер підтвердить наявність і надішле рахунок. Статус можна
          відстежувати в кабінеті.
        </p>
        <Link
          href="/account"
          className="mt-1 inline-flex h-12 items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
        >
          Мої замовлення
        </Link>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-8">
      {state.formError && (
        <p className="rounded-[12px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[15px] leading-[1.5] text-danger-700">
          {state.formError}
        </p>
      )}

      <Radios
        name="delivery"
        title="Спосіб доставки"
        options={deliveries}
        defaultValue={v.delivery}
        error={e.delivery}
      />

      <Radios
        name="payMethod"
        title="Оплата"
        options={payMethods}
        defaultValue={v.payMethod ?? payMethods[0]?.id}
        error={e.payMethod}
      />

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-3 text-[18px] font-semibold leading-[1.4] text-black-900">
          Отримувач
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="recipient"
              className="text-[14px] font-semibold text-black-900"
            >
              Прізвище, ім&apos;я, по батькові *
            </label>
            <input
              id="recipient"
              name="recipient"
              defaultValue={v.recipient ?? ""}
              className={field}
            />
            {e.recipient && <p className={errorText}>{e.recipient}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-[14px] font-semibold text-black-900"
            >
              Телефон *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={v.phone ?? ""}
              placeholder="+380"
              className={field}
            />
            {e.phone && <p className={errorText}>{e.phone}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="city"
              className="text-[14px] font-semibold text-black-900"
            >
              Місто
            </label>
            <input
              id="city"
              name="city"
              defaultValue={v.city ?? ""}
              className={field}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="address"
              className="text-[14px] font-semibold text-black-900"
            >
              Відділення або адреса
            </label>
            <input
              id="address"
              name="address"
              defaultValue={v.address ?? ""}
              placeholder="Напр., відділення №13"
              className={field}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="comment"
            className="text-[14px] font-semibold text-black-900"
          >
            Коментар до замовлення
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            defaultValue={v.comment ?? ""}
            className="w-full rounded-[8px] border border-grey-300 bg-white px-4 py-3 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:border-blue-300 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-3 text-[15px] leading-[1.5] text-black-900">
            <input
              type="checkbox"
              name="needInvoice"
              defaultChecked
              className="size-4 accent-blue-300"
            />
            Потрібен рахунок
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-[15px] leading-[1.5] text-black-900">
            <input
              type="checkbox"
              name="dontCall"
              className="size-4 accent-blue-300"
            />
            Не телефонувати для підтвердження
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-[8px] bg-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:self-start"
      >
        {pending ? "Оформлюємо…" : "Підтвердити замовлення"}
      </button>
    </form>
  );
}
