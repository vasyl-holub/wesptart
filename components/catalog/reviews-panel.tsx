"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, StarFilledIcon } from "@/components/ui/icons";
import { ReviewForm } from "@/components/catalog/review-form";
import {
  toStars,
  type Review,
  type ReviewDistribution,
} from "@/lib/reviews-format";
import { formatDateShort } from "@/lib/format-date";

const STEP = 3;
const LEVELS = [5, 4, 3, 2, 1] as const;

const outlineBtn =
  "flex h-10 w-fit items-center justify-center gap-1.5 rounded-[8px] border border-blue-300 px-5 " +
  "text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25";

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarFilledIcon
          key={i}
          className={
            i < value ? "shrink-0 text-star" : "shrink-0 text-grey-200"
          }
          /* Розмір задає макет: 20 у підсумку, 16 у картці відгуку */
          {...{ style: { width: size, height: size } }}
        />
      ))}
    </span>
  );
}

export function ReviewsPanel({
  productPk,
  rating,
  votes,
  distribution,
  items,
  canReview,
}: {
  productPk: string;
  rating: number;
  votes: number;
  distribution: ReviewDistribution;
  items: Review[];
  canReview: boolean;
}) {
  const [shown, setShown] = useState(STEP);
  const [formOpen, setFormOpen] = useState(false);

  const visible = items.slice(0, shown);
  const max = Math.max(1, ...LEVELS.map((l) => distribution[l]));

  const invite = canReview ? (
    !formOpen && (
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className={outlineBtn}
      >
        Залишити відгук
      </button>
    )
  ) : (
    <p className="text-[15px] leading-[1.55] text-grey-700">
      Відгуки залишають клієнти з кабінетом.{" "}
      <Link
        href="/login"
        className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
      >
        Увійти
      </Link>
    </p>
  );

  /* Поки відгуків немає взагалі, двоколонкова сітка лише розтягує
     порожнечу: статистики зліва нема, списку справа теж. Показуємо
     один компактний блок з одним запрошенням, а не двома. */
  if (votes === 0 && items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
          Відгуки про товар
        </h2>
        <p className="max-w-[640px] text-[16px] leading-[1.6] text-grey-700">
          Про цю деталь ще ніхто не писав. Якщо ви її вже поставили — розкажіть,
          чи підійшла: це найкорисніше для наступного покупця.
        </p>
        {invite}
        {formOpen && (
          <ReviewForm
            productPk={productPk}
            onClose={() => setFormOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-14">
      <div className="flex flex-col gap-5">
        <h2 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
          Відгуки про товар
        </h2>

        {votes > 0 ? (
          <>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-3">
                <span className="tnum text-[24px] font-medium leading-[1.5] text-black-900">
                  {rating.toFixed(1)}/5
                </span>
                <Stars value={Math.round(rating)} size={20} />
              </div>
              <p className="text-[16px] leading-[1.5] text-grey-700">
                На основі <span className="tnum text-black-900">{votes}</span>{" "}
                {votes % 10 === 1 && votes % 100 !== 11 ? "оцінки" : "оцінок"}
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {LEVELS.map((level) => {
                const n = distribution[level];
                return (
                  <li key={level} className="flex items-center gap-4">
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="tnum w-3 text-[16px] leading-[1.5] text-black-900">
                        {level}
                      </span>
                      <StarFilledIcon className="size-5 shrink-0 text-star" />
                    </span>

                    {/* Доріжка фіксованої довжини, як у макеті; заливка
                        рахується від найчисленнішої оцінки */}
                    <span className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-grey-200">
                      <span
                        className="block h-full rounded-full bg-blue-300"
                        style={{ width: `${(n / max) * 100}%` }}
                      />
                    </span>

                    <span className="tnum w-7 shrink-0 text-[16px] leading-[1.5] text-black-900">
                      {n}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {invite}

        {formOpen && (
          <ReviewForm
            productPk={productPk}
            onClose={() => setFormOpen(false)}
          />
        )}
      </div>

      <div className="flex flex-col gap-6">
        {visible.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {visible.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-[12px] border border-grey-200 px-6 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
                      {r.author}
                    </span>
                    {r.vote !== null && <Stars value={toStars(r.vote)} />}
                  </div>
                  <span className="tnum shrink-0 text-[16px] leading-[1.5] text-grey-700">
                    {formatDateShort(r.created)}
                  </span>
                </div>

                <p className="text-[16px] leading-[1.5] text-grey-800">
                  {r.text}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Написаних відгуків поки немає — лише оцінки.
          </p>
        )}

        {items.length > visible.length && (
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            className={outlineBtn}
          >
            Показати більше
            <ChevronDownIcon className="size-5 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
