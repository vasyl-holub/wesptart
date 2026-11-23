import { site } from "@/lib/site";

/**
 * Посилання на Viber менеджера із заготовленим запитанням.
 *
 * Два обмеження, про які варто пам'ятати:
 *
 * 1. `draft` у `viber://chat` офіційно не задокументований — Viber описує
 *    підстановку тексту лише для публічних акаунтів і ботів. Якщо він не
 *    спрацює, чат усе одно відкриється на тому самому менеджері, просто
 *    без тексту: гірше, ніж задумано, але не зламано.
 * 2. Посилання працює лише там, де встановлений застосунок — вебверсії у
 *    Viber немає. Тому поруч із кнопками лишається звичайна заявка.
 */
export function viberLink(text: string) {
  const number = site.phoneHref.replace("tel:", "");
  return `viber://chat?number=${encodeURIComponent(number)}&draft=${encodeURIComponent(text)}`;
}

/** Повна адреса товару — менеджеру потрібне посилання, а не лише артикул */
export function productUrl(slug: string, id: string) {
  return `${site.url}/part/${slug}/${id}/`;
}

/**
 * Короткий опис товару для менеджера.
 *
 * Артикул стоїть першим і йде в той самий рядок, що й привітання: назви
 * в каталозі бувають по 200 символів (у них зашита вся застосовність —
 * «…AUDI 80 B1 80 B2 … 05.72-08.91»), і артикул окремим рядком під такою
 * назвою просто не влазив у вікно вводу Viber. Менеджер бачив питання
 * без коду товару.
 */
export function productRef(p: {
  num: string;
  brand: string | null;
  code: string | null;
}) {
  return [p.num, p.brand && `— ${p.brand}`, p.code && `(код ${p.code})`]
    .filter(Boolean)
    .join(" ");
}

/** Назва з обрізанням по слову плюс посилання на сторінку товару */
export function productBody(p: { name: string; slug: string; id: string }) {
  return `${shorten(p.name, 90)}\n${productUrl(p.slug, p.id)}`;
}

function shorten(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).trim()}…`;
}
