"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { addReviewAction, type ReviewFormState } from "@/app/part/actions";

const EMPTY: ReviewFormState = {};

export function ReviewForm({ productPk }: { productPk: string }) {
  const [state, action, pending] = useActionState(addReviewAction, EMPTY);
  const err = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <p
        aria-live="polite"
        className="rounded-[8px] bg-green-50 px-4 py-3 text-[15px] leading-[1.5] text-green-300"
      >
        Дякуємо! Відгук опубліковано.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="productPk" value={productPk} />

      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[15px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      <Textarea
        name="text"
        rows={4}
        defaultValue={state.values?.text}
        invalid={Boolean(err.text)}
        aria-label="Ваш відгук"
        placeholder="Чи підійшла деталь, як довго їхала, що варто знати іншим покупцям"
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
          variant: "primary",
          className: "w-full sm:w-auto sm:self-start",
        })}
      >
        {pending ? "Надсилаємо…" : "Опублікувати відгук"}
      </button>
    </form>
  );
}
