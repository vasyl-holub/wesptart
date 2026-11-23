import type { CarFits } from "@/lib/api/car-fits";

/* Один товар — один запит на вкладку. Таблиця пропозицій показує
   десятки рядків, і без цього кожне повторне наведення йшло б у мережу.
   Коротка відповідь і повний перелік кешуються окремо: підказці вистачає
   підсумку, а вікну потрібні всі рядки. */
const brief = new Map<string, Promise<CarFits | null>>();
const full = new Map<string, Promise<CarFits | null>>();

/**
 * Застосовність товару з `/api/compat/`.
 *
 * Живе окремим модулем, щоб і значок у таблиці, і картка на сторінці
 * товару ділили один кеш: інакше відкриття вікна після наведення йшло б
 * у мережу вдруге.
 */
export function loadCarFits(id: string, onlySummary: boolean) {
  const store = onlySummary ? brief : full;
  const cached = store.get(id);
  if (cached) return cached;

  const query = `/api/compat/?id=${encodeURIComponent(id)}${
    onlySummary ? "&brief=1" : ""
  }`;

  const request = fetch(query)
    .then((r) => (r.ok ? (r.json() as Promise<CarFits>) : null))
    .catch(() => null);

  store.set(id, request);
  return request;
}
