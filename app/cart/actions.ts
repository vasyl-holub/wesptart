"use server";

import { revalidatePath } from "next/cache";
import {
  addCartItem,
  deleteCartItems,
  getCart,
  setCartItemCount,
} from "@/lib/api/cart";

export type CartActionState = { error?: string };

/** Скільки одиниць максимум дозволяємо ввести вручну */
const MAX_COUNT = 999;

/**
 * itemId — це ідентифікатор пропозиції складу (StoreItem), а не товару.
 * Той самий товар може лежати на кількох складах із різними цінами.
 */
export async function addToCartAction(itemId: string, count = 1) {
  try {
    await addCartItem(itemId, Math.min(MAX_COUNT, Math.max(1, count)));
  } catch {
    return { error: "Не вдалося додати в кошик. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return {};
}

export async function changeCountAction(cartItemId: string, count: number) {
  const safe = Math.min(MAX_COUNT, Math.max(1, Math.round(count)));

  try {
    await setCartItemCount(cartItemId, safe);
  } catch {
    return { error: "Не вдалося змінити кількість. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return {};
}

export async function removeItemAction(cartItemId: string) {
  try {
    await deleteCartItems([cartItemId]);
  } catch {
    return { error: "Не вдалося видалити позицію. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return {};
}

export async function clearCartAction() {
  try {
    const cart = await getCart();
    if (cart.items.length) {
      await deleteCartItems(cart.items.map((i) => i.id));
    }
  } catch {
    return { error: "Не вдалося очистити кошик. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return {};
}
