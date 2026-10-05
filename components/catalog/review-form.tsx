"use client";

import { useActionState, useState } from "react";
import { Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { StarFilledIcon } from "@/components/ui/icons";
import { addReviewAction, type ReviewFormState } from "@/app/part/actions";

const EMPTY: ReviewFormState = {};
const STARS = [1, 2, 3, 4, 5];

export function ReviewForm({
  productPk,
  onClose,
}: {
  productPk: string;
  onClose?: () => void;
}) {
  const [state, action, pending] = useActionState(addReviewAction, EMPTY);
  /* hover окремо від вибраного: під час наведення показуємо майбутню
     оцінку, але не втрачаємо вже поставлену */
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
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

  const shown = hover || stars;

  return (
    /* Ширину задаємо явно: форма стоїть у контейнері з items-start,
       де w-full стискається до вмісту */
    <form
      action={action}
      className="flex w-full max-w-[640px] flex-col gap-3"
      noValidate
    >
      <input type="hidden" name="productPk" value={productPk} />
      <input type="hidden" name="stars" value={stars} />

      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[15px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] leading-[1.5] text-grey-700">
          Ваша оцінка
        </span>
        <span
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {STARS.map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Оцінка ${n} з 5`}
              aria-pressed={stars === n}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => setStars(n)}
              className="rounded-[4px] p-0.5 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-300"
            >
              <StarFilledIcon
                className={`size-7 ${n <= shown ? "text-star" : "text-grey-200"}`}
              />
            </button>
          ))}
        </span>
        {err.stars && (
          <p
            role="alert"
            className="text-[12.5px] leading-[1.4] text-danger-700"
          >
            {err.stars}
          </p>
        )}
      </div>

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

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "primary" })}
        >
          {pending ? "Надсилаємо…" : "Опублікувати відгук"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={buttonClasses({ variant: "ghost" })}
          >
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}
