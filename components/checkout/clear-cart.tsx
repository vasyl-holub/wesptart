"use client";

import { useEffect } from "react";
import { setCartCount } from "@/lib/cart-count";

/**
 * Обнуляє значок кошика після оформлення. Нічого не малює.
 *
 * Потрібен, бо шапка живе в кореневому layout і після редіректу не
 * перемонтовується — лічильник так і показував би позиції щойно
 * оформленого замовлення.
 */
export function ClearCart() {
  useEffect(() => {
    setCartCount(0);
  }, []);

  return null;
}
