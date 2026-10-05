"use client";

import { useEffect } from "react";
import {
  loadCartCount,
  refreshCartCount,
  useCartCount,
} from "@/lib/cart-count";

/**
 * Лічильник над значком кошика. Нічого не рендерить, поки кошик
 * порожній — порожній кружечок на кожній сторінці лише шумить.
 */
export function CartBadge() {
  const count = useCartCount();

  useEffect(() => {
    void loadCartCount();

    /* Кошик могли змінити в іншій вкладці або з іншого пристрою —
       перепитуємо, коли вкладка знову стає активною */
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshCartCount();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (count <= 0) return null;

  return (
    <span
      /* aria-hidden: кількість уже є в підписі самого посилання,
         інакше читалка двічі промовить одне число */
      aria-hidden
      className="tnum pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-300 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
