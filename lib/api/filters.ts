/** Хелпери для аргументів-фільтрів: спільні для всіх списків кабінету. */

/** Межі дат у форматі бекенду; обидві необов'язкові */
export function dateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  return { ...(from ? { start: from } : {}), ...(to ? { end: to } : {}) };
}

/** Порожні рядки з форми не повинні перетворюватись на фільтр */
export function text(value?: string) {
  const v = value?.trim();
  return v ? v : undefined;
}
