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
