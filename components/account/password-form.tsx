"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import {
  changePasswordAction,
  type AccountFormState,
} from "@/app/account/actions";

const EMPTY: AccountFormState = {};

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, EMPTY);
  const err = state.fieldErrors ?? {};

  return (
    /* key скидає поля після успіху — тримати введені паролі нема сенсу */
    <form
      key={state.ok ? "done" : "edit"}
      action={action}
      className="flex flex-col gap-5"
      noValidate
    >
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
          Пароль змінено
        </p>
      )}

      <Field
        label="Поточний пароль"
        htmlFor="oldPassword"
        error={err.oldPassword}
        required
      >
        <Input
          id="oldPassword"
          name="oldPassword"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(err.oldPassword)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Новий пароль"
          htmlFor="newPassword"
          error={err.newPassword}
          hint="Мінімум 6 символів"
          required
        >
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            invalid={Boolean(err.newPassword)}
          />
        </Field>

        <Field
          label="Повторіть новий"
          htmlFor="newPassword2"
          error={err.newPassword2}
          required
        >
          <Input
            id="newPassword2"
            name="newPassword2"
            type="password"
            autoComplete="new-password"
            invalid={Boolean(err.newPassword2)}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({
          variant: "outline",
          className: "w-full sm:w-auto sm:self-start",
        })}
      >
        {pending ? "Змінюємо…" : "Змінити пароль"}
      </button>
    </form>
  );
}
