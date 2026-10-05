"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import {
  CameraIcon,
  CarIcon,
  CartIcon,
  CircleCheckIcon,
  InfoCircleIcon,
} from "@/components/ui/icons";
import { addToCartAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";
import { formatMoney } from "@/lib/cn";

/** Один рядок таблиці: і власна пропозиція складу, і товар-аналог */
export type OfferRow = {
  key: string;
  offerId: string;
  brand: string | null;
  num: string;
  name: string;
  quality: string | null;
  deliveryDays: string | null;
  count: number | null;
  price: number | null;
  canBuy: boolean;
  image: string | null;
  /** Є лише в аналогів — рядок веде на сторінку того товару */
  href?: string;
};

export const offersColumns = [
  "Фото",
  "Виробник",
  "Артикул",
  "Назва",
  "Якість",
  "",
  "Доставка",
  "Наявність",
  "Ціна",
  "Дія",
];

function AddButton({ offerId, label }: { offerId: string; label: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label={`Додати в кошик: ${label}`}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await addToCartAction(offerId, 1);
          if (!res.error && res.count !== undefined) setCartCount(res.count);
          setState(res.error ? "err" : "ok");
        })
      }
      className={`inline-flex size-10 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
        state === "ok"
          ? "bg-green-300 text-white"
          : state === "err"
            ? "bg-danger-700 text-white"
            : "bg-blue-300 text-white hover:bg-blue-700"
      }`}
    >
      {state === "ok" ? (
        <CircleCheckIcon className="size-6" />
      ) : (
        <CartIcon className="size-6" strokeWidth={2} />
      )}
    </button>
  );
}

export function OffersTable({
  rows,
  selectedKey,
  onSelect,
}: {
  rows: OfferRow[];
  /** Підсвічений рядок — обрана пропозиція, а не просто перша */
  selectedKey?: string;
  /** Передають лише для «Варіантів поставки»: аналоги це інші товари,
      їх не обирають, на них переходять */
  onSelect?: (key: string) => void;
}) {
  if (!rows.length) return null;

  return (
    /* Дев'ять колонок не влазять у телефон, тому таблиця гортається вбік
       усередині свого контейнера — сторінка при цьому не їде */
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr>
            {offersColumns.map((c, i) => (
              <th
                key={c || `col-${i}`}
                scope="col"
                className="whitespace-nowrap px-3 pb-3 text-[14px] font-semibold leading-[1.5] text-black-900 first:pl-0 last:pr-0 last:text-right"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const selected = r.key === selectedKey;
            return (
              <tr
                key={r.key}
                aria-selected={onSelect ? selected : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={onSelect ? () => onSelect(r.key) : undefined}
                onKeyDown={
                  onSelect
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(r.key);
                        }
                      }
                    : undefined
                }
                /* Рядків багато й вони вузькі — підсвітка на ховері не дає
                 зчитати ціну з одного рядка, а строк поставки з сусіднього */
                className={
                  selected
                    ? "bg-[#eaf4ff] transition-colors hover:bg-[#dbe9f8] [&>td:first-child]:rounded-l-[8px] [&>td:last-child]:rounded-r-[8px]"
                    : `border-t border-grey-200 transition-colors hover:bg-grey-100 ${
                        onSelect
                          ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-300"
                          : ""
                      }`
                }
              >
                <td className="px-3 py-3 first:pl-3">
                  <span className="block size-12 overflow-hidden rounded-[4px] border border-grey-200 bg-white">
                    <ProductPhoto
                      sources={r.image ? [r.image] : []}
                      alt=""
                      article={r.num}
                      width={48}
                      height={48}
                      className="size-full object-cover"
                      placeholderIconClassName="size-5"
                    />
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                  {r.brand ?? "—"}
                </td>

                <td className="tnum whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                  {r.num}
                </td>

                <td className="min-w-[180px] px-3 py-3 text-[14px] leading-[1.5] text-black-900">
                  {r.href ? (
                    <Link
                      href={r.href}
                      className="transition-colors hover:text-blue-300"
                    >
                      {r.name || "—"}
                    </Link>
                  ) : (
                    r.name || "—"
                  )}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                  {r.quality ?? "—"}
                </td>

                {/* Три швидкі переходи до картки товару: опис, фото, застосовність */}
                <td className="px-3 py-3">
                  <span className="flex items-center gap-2 text-blue-300">
                    <Link
                      href={r.href ? r.href : "#specs"}
                      aria-label="Характеристики"
                      title="Характеристики"
                      className="transition-opacity hover:opacity-70"
                    >
                      <InfoCircleIcon className="size-5" />
                    </Link>
                    <Link
                      href={r.href ? r.href : "#gallery"}
                      aria-label="Фото товару"
                      title="Фото товару"
                      className="transition-opacity hover:opacity-70"
                    >
                      <CameraIcon className="size-5" />
                    </Link>
                    <Link
                      href={r.href ? r.href : "#specs"}
                      aria-label="Застосовність"
                      title="На які авто підходить"
                      className="transition-opacity hover:opacity-70"
                    >
                      <CarIcon className="size-5" />
                    </Link>
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                  {r.deliveryDays ?? "—"}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  <span className="flex items-center gap-1.5 text-[14px] leading-[1.5] text-black-900">
                    {(r.count ?? 0) > 0 && (
                      <CircleCheckIcon className="size-5 shrink-0 text-green-300" />
                    )}
                    <span className="tnum">{r.count ?? 0}</span>
                  </span>
                </td>

                <td className="tnum whitespace-nowrap px-3 py-3 text-[14px] font-semibold leading-[1.5] text-blue-300">
                  {r.price === null ? "—" : formatMoney(r.price)}
                </td>

                <td className="px-3 py-3 text-right last:pr-3">
                  {r.canBuy && (r.count ?? 0) > 0 ? (
                    <AddButton
                      offerId={r.offerId}
                      label={`${r.brand ?? ""} ${r.num}`}
                    />
                  ) : (
                    <span className="text-[13px] leading-[1.4] text-grey-600">
                      немає
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
