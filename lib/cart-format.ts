/**
 * Типи й чисті функції кошика — без серверних залежностей.
 *
 * Окремо від lib/api/cart.ts навмисно: там використовується next/headers,
 * і будь-який імпорт звідти в клієнтський компонент ламає збірку.
 */

export type CartItem = {
  id: string;
  count: number;
  price: number;
  total: number;
  isActive: boolean;
  product: {
    id: string;
    num: string;
    name: string;
    slug: string;
    /** Порожній у частини товарів — тоді фото дотягуємо окремим запитом */
    images: string[] | null;
    manufacturer: { name: string } | null;
  } | null;
  priceItem: {
    id: string;
    priceOut: number | null;
    /** Скільки одиниць є на складі */
    count: number | null;
    deliveryDaysHumanize: string | null;
    canBuy: boolean | null;
  } | null;
};

export type Cart = {
  id: string;
  total: number;
  /** Кількість позицій, не одиниць */
  positions: number;
  items: CartItem[];
};

export type Shipment = {
  /** «3-4 дн.», «склад» або «Уточнюється» */
  days: string;
  items: CartItem[];
};

/**
 * Строк приходить рядком: «3-4 дн.», «21-30 дн.» або «склад».
 * Для сортування витягуємо перше число, склад вважаємо нулем.
 */
function deliveryWeight(days: string) {
  if (/склад/i.test(days)) return 0;
  const match = days.match(/\d+/);
  return match ? Number(match[0]) : 999;
}

/** Людський підпис відправки: «Зі складу» замість «Доставка склад» */
export function deliveryLabel(days: string) {
  if (/склад/i.test(days)) return "Зі складу";
  if (/уточн/i.test(days)) return "Строк уточнюється";
  return `Доставка ${days}`;
}

/**
 * Позиції з різних складів приїжджають різними відправками — групуємо за
 * строком, щоб людина бачила це в кошику, а не дізналась після оплати.
 * Найшвидша відправка йде першою.
 */
export function groupByDelivery(items: CartItem[]): Shipment[] {
  const groups = new Map<string, CartItem[]>();

  for (const item of items) {
    const days = item.priceItem?.deliveryDaysHumanize?.trim() || "Уточнюється";
    const list = groups.get(days);
    if (list) list.push(item);
    else groups.set(days, [item]);
  }

  return [...groups]
    .map(([days, list]) => ({ days, items: list }))
    .sort((a, b) => deliveryWeight(a.days) - deliveryWeight(b.days));
}

/** Загальна кількість одиниць у кошику */
export function totalUnits(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.count ?? 0), 0);
}
