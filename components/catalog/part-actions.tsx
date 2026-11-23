"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CartIcon,
  ChevronDownIcon,
  HeadsetIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { QuantityInput } from "@/components/ui/quantity-input";
import { FavoriteButton } from "@/components/catalog/favorite-button";
import { formatMoney } from "@/lib/cn";
import { productBody, productRef, viberLink } from "@/lib/viber";
import type { Product } from "@/lib/api/product";
import { addToCartAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";

const btn =
  "flex h-12 w-full items-center justify-center gap-1.5 rounded-[8px] px-5 text-[16px] font-semibold leading-[1.5] transition-colors disabled:opacity-60";

export function PartActions({
  product,
  priceLabel = "Від",
}: {
  product: Product;
  /** Для свого клієнта це вже його ціна з урахуванням рівня, а не «від» */
  priceLabel?: string;
}) {
  const offer = product.bestOffer;

  /* Менеджеру потрібне не «цікавить деталь», а яка саме: тому в кожну
     кнопку кладемо артикул, назву й посилання на цю сторінку. Різниця
     між кнопками — у питанні, а не в адресаті. */
  const ref = productRef(product);
  const body = productBody(product);

  const asks = {
    request: viberLink(
      `Доброго дня! Потрібна деталь ${ref}, якої зараз немає в наявності.
${body}
Підкажіть, будь ласка, строк поставки або аналог.`,
    ),
    /* Окрема кнопка «Перевірити по VIN» була третім способом написати
       тому самому менеджеру в той самий Viber. Лишилась одна, а питання
       про авто стало рядком у ній: VIN клієнт допише сам. */
    manager: viberLink(`Доброго дня! Питання по товару ${ref}.
${body}
Мій VIN (якщо потрібно перевірити, чи підійде): `),
  };
  const available = Boolean(offer?.canBuy && (offer?.count ?? 0) > 0);
  const stock = offer?.count ?? 0;

  const [count, setCount] = useState(1);
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const add = () => {
    if (!offer) return;
    setState("idle");
    startTransition(async () => {
      const res = await addToCartAction(offer.id, count);
      if (!res.error && res.count !== undefined) setCartCount(res.count);
      setState(res.error ? "error" : "added");
    });
  };

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border border-grey-200 px-6 pb-6 pt-5">
      {available && offer ? (
        <div className="flex flex-col gap-1.5">
          <p className="flex items-baseline gap-2.5">
            <span className="text-[16px] leading-[1.5] text-black-900">
              {priceLabel}
            </span>
            <span className="tnum text-[24px] font-semibold leading-[1.5] text-green-300">
              {formatMoney(offer.price ?? 0)}
            </span>
          </p>

          {offer.deliveryDays && (
            <p className="flex items-center gap-2 text-[14px] leading-[1.5] text-grey-700">
              <TruckIcon className="size-6 shrink-0 text-blue-300" />
              Найшвидша доставка {offer.deliveryDays}
            </p>
          )}
        </div>
      ) : (
        /* Немає жодної пропозиції складу — не показуємо ні ціни, ні кнопки
           купівлі: замість цього ведемо до заявки на підбір */
        <div className="flex flex-col gap-1.5">
          <p className="text-[20px] font-semibold leading-[1.5] text-grey-700">
            Немає в наявності
          </p>
          <p className="text-[14px] leading-[1.5] text-grey-700">
            Позиція тимчасово відсутня на складах. Залиште заявку — повідомимо,
            щойно з&apos;явиться, або підберемо аналог.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {available ? (
          <>
            <div className="flex items-center gap-3">
              <QuantityInput
                value={count}
                onChange={setCount}
                disabled={pending}
                label="Кількість"
              />
              <span className="tnum text-[14px] leading-[1.5] text-grey-700">
                на складі {stock} шт.
              </span>
            </div>

            {/* Залишком не обмежуємо: клієнту потрібна потреба, а не те,
                що лежить на одному складі. Менеджер добере решту в інших
                постачальників — але попередити про це треба відразу */}
            {count > stock && (
              <p className="rounded-[8px] bg-blue-25 px-4 py-2.5 text-[14px] leading-[1.5] text-grey-700">
                На складі зараз {stock} шт. Решту менеджер пошукає в інших
                постачальників і запропонує варіанти.
              </p>
            )}

            <button
              type="button"
              onClick={add}
              disabled={pending}
              className={`${btn} bg-blue-300 text-white hover:bg-blue-700`}
            >
              {pending ? "Додаємо…" : "Додати в кошик"}
              <CartIcon className="size-5 shrink-0" strokeWidth={2.4} />
            </button>

            {state === "added" && (
              <p
                aria-live="polite"
                className="flex items-center justify-between gap-3 rounded-[8px] bg-green-50 px-4 py-2.5 text-[14px] leading-[1.5] text-green-300"
              >
                Додано в кошик
                <Link
                  href="/cart"
                  className="font-semibold underline underline-offset-2"
                >
                  Перейти
                </Link>
              </p>
            )}

            {state === "error" && (
              <p
                role="alert"
                className="rounded-[8px] bg-danger-50 px-4 py-2.5 text-[14px] leading-[1.5] text-danger-700"
              >
                Не вдалося додати в кошик. Спробуйте ще раз.
              </p>
            )}
          </>
        ) : (
          <a
            href={asks.request}
            className={`${btn} bg-blue-300 text-white hover:bg-blue-700`}
          >
            Залишити заявку
            <HeadsetIcon className="size-5 shrink-0" />
          </a>
        )}

        <a
          href={asks.manager}
          className={`${btn} border border-blue-300 bg-white text-blue-300 hover:bg-blue-25`}
        >
          Написати менеджеру
          <HeadsetIcon className="size-5 shrink-0" />
        </a>

        {/* Таблиця пропозицій лежить нижче за опис і характеристики —
            без цієї кнопки до неї доводилось гортати наосліп */}
        <a
          href="#offers"
          className={`${btn} border border-blue-300 bg-white text-blue-300 hover:bg-blue-25`}
        >
          Варіанти поставки та аналоги
          <ChevronDownIcon className="size-5 shrink-0" />
        </a>

        <FavoriteButton productId={product.id} initial={product.isFavorite} />

        {/* Вебверсії у Viber немає, тому без застосунку кнопки вище нічого
            не відкриють. Залишаємо звичайний шлях — інакше на десктопі це
            глухий кут */}
        <Link
          href="/requests/create"
          className="text-center text-[13px] leading-[1.5] text-grey-700 underline underline-offset-2 transition-colors hover:text-blue-300"
        >
          Немає Viber? Залишити заявку на сайті
        </Link>
      </div>
    </div>
  );
}
