"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { formatMoney } from "@/lib/cn";
import { deliveryLabel, type CartItem } from "@/lib/cart-format";
import { changeCountAction, removeItemAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";

/** Назва рядком: деталь, бренд, артикул — як у картці товару */
function lineTitle(item: CartItem) {
  const p = item.product;
  if (!p) return "Позиція";
  return [p.name, p.manufacturer?.name, p.num].filter(Boolean).join(", ");
}

export function CartLine({ item }: { item: CartItem }) {
  const [count, setCount] = useState(item.count);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const product = item.product;
  const href = product ? `/part/${product.slug}/${product.id}` : "/cart";
  /* Скільки максимум можна взяти — обмежує залишок складу */
  const max = item.priceItem?.count ?? 999;
  const unit = item.price ?? item.priceItem?.priceOut ?? 0;

  const apply = (next: number) => {
    setCount(next);
    setError(undefined);
    startTransition(async () => {
      const res = await changeCountAction(item.id, next);
      if (res.error) {
        setError(res.error);
        setCount(item.count);
      } else if (res.count !== undefined) {
        setCartCount(res.count);
      }
    });
  };

  const remove = () => {
    setError(undefined);
    startTransition(async () => {
      const res = await removeItemAction(item.id);
      if (res.error) setError(res.error);
      else if (res.count !== undefined) setCartCount(res.count);
    });
  };

  return (
    <li
      className={`flex flex-col gap-4 py-5 transition-opacity sm:flex-row sm:gap-5 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <Link
        href={href}
        aria-label={lineTitle(item)}
        className="block size-24 shrink-0 overflow-hidden rounded-[12px] border border-grey-200 bg-white sm:size-28"
      >
        <ProductPhoto
          sources={product?.images ?? []}
          alt=""
          article={product?.num ?? ""}
          width={112}
          height={112}
          className="size-full object-cover"
          placeholderIconClassName="size-7"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[16px] font-semibold leading-[1.5] text-black-900">
            <Link href={href} className="transition-colors hover:text-blue-300">
              {lineTitle(item)}
            </Link>
          </h3>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label={`Видалити ${lineTitle(item)} з кошика`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-danger-50 hover:text-danger-700 disabled:opacity-50"
          >
            <Trash2 className="size-5" strokeWidth={1.9} />
          </button>
        </div>

        {item.priceItem?.deliveryDaysHumanize && (
          <p className="text-[14px] leading-[1.5] text-grey-700">
            {deliveryLabel(item.priceItem.deliveryDaysHumanize.trim())}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <QuantityInput
              value={count}
              onChange={apply}
              max={max}
              disabled={pending}
              label={`Кількість — ${lineTitle(item)}`}
            />
            <span className="tnum whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
              × {formatMoney(unit)}
            </span>
          </div>

          <p className="tnum whitespace-nowrap text-[20px] font-semibold leading-[1.5] text-black-900">
            {formatMoney(unit * count)}
          </p>
        </div>

        {count >= max && (
          <p className="tnum text-[14px] leading-[1.5] text-grey-600">
            Це весь залишок на складі — {max} шт.
          </p>
        )}

        {error && (
          <p role="alert" className="text-[14px] leading-[1.5] text-danger-700">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
