"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import {
  updateProfileAction,
  type AccountFormState,
} from "@/app/account/actions";
import type { Profile } from "@/lib/api/account";
import type { RegionOption } from "@/lib/api/auth";

const EMPTY: AccountFormState = {};

export function ProfileForm({
  profile,
  regions,
}: {
  profile: Profile;
  regions: RegionOption[];
}) {
  const [state, action, pending] = useActionState(updateProfileAction, EMPTY);
  const err = state.fieldErrors ?? {};
  /* Після помилки показуємо введене, інакше — те, що прийшло з API */
  const v = state.values ?? {};
  const val = (key: keyof Profile, formKey = key as string) =>
    v[formKey] ?? (profile[key] as string | null) ?? "";

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
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
          Дані збережено
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Прізвище"
          htmlFor="lastName"
          error={err.lastName}
          required
        >
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={val("lastName")}
            invalid={Boolean(err.lastName)}
          />
        </Field>

        <Field label="Ім'я" htmlFor="firstName" error={err.firstName} required>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={val("firstName")}
            invalid={Boolean(err.firstName)}
          />
        </Field>
      </div>

      <Field label="По батькові" htmlFor="fatherName" error={err.fatherName}>
        <Input
          id="fatherName"
          name="fatherName"
          defaultValue={val("fatherName")}
          invalid={Boolean(err.fatherName)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={err.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={val("email")}
            invalid={Boolean(err.email)}
          />
        </Field>

        <Field label="Телефон" htmlFor="phone" error={err.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={val("phone")}
            invalid={Boolean(err.phone)}
          />
        </Field>
      </div>

      <Field label="Компанія" htmlFor="company" error={err.company}>
        <Input
          id="company"
          name="company"
          autoComplete="organization"
          defaultValue={val("company")}
          invalid={Boolean(err.company)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Область" htmlFor="region" error={err.region}>
          <Select
            id="region"
            name="region"
            defaultValue={v.region ?? profile.regionId ?? ""}
            invalid={Boolean(err.region)}
          >
            <option value="">Не вказано</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Місто" htmlFor="city" error={err.city}>
          <Input
            id="city"
            name="city"
            autoComplete="address-level2"
            defaultValue={val("city")}
            invalid={Boolean(err.city)}
          />
        </Field>
      </div>

      <Field label="Адреса" htmlFor="address" error={err.address}>
        <Input
          id="address"
          name="address"
          autoComplete="street-address"
          defaultValue={val("address")}
          invalid={Boolean(err.address)}
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
        {pending ? "Зберігаємо…" : "Зберегти зміни"}
      </button>
    </form>
  );
}
