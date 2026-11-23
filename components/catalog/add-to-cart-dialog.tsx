"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { QuantityInput } from "@/components/ui/quantity-input";
import { buttonClasses } from "@/components/ui/button";
import { addToCartAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";
import { formatMoney } from "@/lib/cn";
import type { OfferRow } from "@/components/catalog/offers-table";

/**
 * Вікно «додати в кошик» із вибором кількості.
 *
 * Раніше значок клав одну штуку й мовчки закривав питання — а в таблиці
 * пропозицій саме кількість і вирішують, бо поруч стоять кілька складів
 * з різними залишками. Принцип узятий зі старого кабінету: показуємо, що
 * саме додаємо, і даємо вказати скільки.
 */
export function AddToCartDialog({
  row,
  onClose,
  onAdded,
}: {
  row: OfferRow;
  onClose: () => void;
  /** Щоб значок у таблиці коротко підтвердив, що позиція додана */
  onAdded?: () => void;
}) {
  const stock = row.count ?? 0;
  const [count, setCount] = useState(1);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  /* Escape закриває, а сторінка під вікном не має прокручуватись */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = () => {
    setError("");
    start(async () => {
      const res = await addToCartAction(row.offerId, count);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.count !== undefined) setCartCount(res.count);
      onAdded?.();
      onClose();
    });
  };

  const specs = (row.specs ?? []).slice(0, 5);
  const sum = row.price === null ? null : row.price * count;

  return createPortal(
    <div
      /* Клік повз вікно закриває — звичний жест для таких вікон */
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black-900/50 p-0 sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Додати в кошик"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[20px] bg-white sm:rounded-[20px]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-grey-200 px-5 py-4">
          <h2 className="text-[17px] font-semibold leading-[1.4] text-black-900">
            Додати в кошик
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-100 hover:text-black-900"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex gap-4">
            <span className="block size-24 shrink-0 overflow-hidden rounded-[12px] border border-grey-200 bg-white">
              <ProductPhoto
                sources={row.image ? [row.image] : []}
                alt=""
                article={row.num}
                width={96}
                height={96}
                className="size-full object-contain p-1"
                placeholderIconClassName="size-6"
              />
            </span>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[15px] leading-[1.45] text-black-900">
                {row.name || "Товар"}
              </span>
              <span className="tnum text-[13px] leading-[1.45] text-grey-600">
                {[row.brand, row.num].filter(Boolean).join(" · ")}
              </span>
              <span className="text-[13px] leading-[1.45] text-grey-600">
                На складі: <span className="tnum">{stock}</span> шт.
                {row.deliveryDays && ` · доставка ${row.deliveryDays}`}
              </span>
            </div>
          </div>

          {specs.length > 0 && (
            <dl className="flex flex-col gap-1.5 rounded-[12px] bg-grey-100 px-4 py-3">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="flex gap-3 text-[13px] leading-[1.45]"
                >
                  <dt className="shrink-0 text-grey-600">{s.label}</dt>
                  <dd className="ml-auto text-right font-medium text-black-900">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <QuantityInput
              value={count}
              onChange={setCount}
              disabled={pending}
            />

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[13px] leading-[1.4] text-grey-600">
                Сума
              </span>
              <span className="tnum text-[20px] font-semibold leading-[1.3] text-blue-300">
                {sum === null ? "—" : formatMoney(sum)}
              </span>
            </div>
          </div>

          {/* Залишком не обмежуємо: на одному складі лежить два, а клієнту
              треба чотири — менеджер добере решту в інших постачальників.
              Але сказати про це треба відразу, щоб строк не був сюрпризом */}
          {count > stock && (
            <p className="rounded-[8px] bg-blue-25 px-4 py-2.5 text-[14px] leading-[1.5] text-grey-700">
              На складі зараз {stock} шт. Решту менеджер пошукає в інших
              постачальників і запропонує варіанти.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-[8px] bg-danger-50 px-4 py-2.5 text-[14px] leading-[1.5] text-danger-700"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-grey-200 px-5 py-4 sm:flex-row-reverse">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className={buttonClasses({ className: "w-full sm:w-auto" })}
          >
            {pending ? "Додаємо…" : "До кошика"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={buttonClasses({
              variant: "outline",
              className: "w-full sm:w-auto",
            })}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
