"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { saveCarAction, type AccountFormState } from "@/app/account/actions";
import type { CarAttributes, UserCar } from "@/lib/api/account";

const EMPTY: AccountFormState = {};

export function CarForm({
  attributes,
  car,
}: {
  attributes: CarAttributes;
  car?: UserCar;
}) {
  const [state, action, pending] = useActionState(saveCarAction, EMPTY);
  /* Форму додавання тримаємо згорнутою, щоб список авто лишався головним */
  const [open, setOpen] = useState(Boolean(car));
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses({
          variant: "primary",
          className: "w-full sm:w-auto sm:self-start",
        })}
      >
        Додати автомобіль
      </button>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-5 rounded-[16px] border border-grey-200 p-5 sm:p-6"
      noValidate
    >
      {car && <input type="hidden" name="id" value={car.id} />}

      <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
        {car ? "Редагувати автомобіль" : "Новий автомобіль"}
      </h3>

      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[16px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      {state.ok && (
        <p
          aria-live="polite"
          className="rounded-[8px] bg-green-50 px-4 py-3 text-[16px] leading-[1.5] text-green-300"
        >
          Автомобіль збережено
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Марка" htmlFor="brand" error={err.brand} required>
          <Input
            id="brand"
            name="brand"
            defaultValue={v.brand ?? car?.brand ?? ""}
            invalid={Boolean(err.brand)}
            placeholder="Skoda"
          />
        </Field>

        <Field label="Модель" htmlFor="model" error={err.model} required>
          <Input
            id="model"
            name="model"
            defaultValue={v.model ?? car?.model ?? ""}
            invalid={Boolean(err.model)}
            placeholder="Octavia"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Рік" htmlFor="year" error={err.year} required>
          <Input
            id="year"
            name="year"
            inputMode="numeric"
            defaultValue={v.year ?? (car?.year ? String(car.year) : "")}
            invalid={Boolean(err.year)}
            placeholder="2012"
          />
        </Field>

        <Field label="Об'єм, л" htmlFor="litres" error={err.litres} required>
          <Input
            id="litres"
            name="litres"
            inputMode="decimal"
            defaultValue={v.litres ?? car?.litres ?? ""}
            invalid={Boolean(err.litres)}
            placeholder="1.6"
          />
        </Field>

        <Field label="Тип" htmlFor="type" error={err.type} required>
          <Select
            id="type"
            name="type"
            defaultValue={v.type ?? ""}
            invalid={Boolean(err.type)}
          >
            <option value="">Оберіть</option>
            {attributes.types.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Кузов" htmlFor="body" error={err.body} required>
          <Select
            id="body"
            name="body"
            defaultValue={v.body ?? ""}
            invalid={Boolean(err.body)}
          >
            <option value="">Оберіть</option>
            {attributes.bodies.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Коробка" htmlFor="transmission" error={err.transmission}>
          <Select
            id="transmission"
            name="transmission"
            defaultValue={v.transmission ?? ""}
            invalid={Boolean(err.transmission)}
          >
            <option value="">Не вказано</option>
            {attributes.transmissions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Привід" htmlFor="drive" error={err.drive}>
          <Select
            id="drive"
            name="drive"
            defaultValue={v.drive ?? ""}
            invalid={Boolean(err.drive)}
          >
            <option value="">Не вказано</option>
            {attributes.drives.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="VIN"
          htmlFor="vin"
          error={err.vin}
          hint="17 символів — з ним підбір найточніший"
        >
          <Input
            id="vin"
            name="vin"
            maxLength={17}
            defaultValue={v.vin ?? car?.vin ?? ""}
            invalid={Boolean(err.vin)}
            className="uppercase"
          />
        </Field>

        <Field
          label="Модифікація"
          htmlFor="modification"
          error={err.modification}
        >
          <Input
            id="modification"
            name="modification"
            defaultValue={v.modification ?? car?.modification ?? ""}
            invalid={Boolean(err.modification)}
            placeholder="1.6 TDI"
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "primary" })}
        >
          {pending ? "Зберігаємо…" : "Зберегти"}
        </button>
        {!car && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={buttonClasses({ variant: "ghost" })}
          >
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}
