/**
 * Період «від–до» для розділів, які читають історію: взаєморозрахунки,
 * виписки, статистика. Межі тримаємо в адресі, тому обробка однакова.
 */

export type Period = { from: string; to: string };

/** `YYYY-MM-DD` — формат, який приймає DateRangeFieldInput */
function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDays(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

export const PERIOD_PRESETS = [
  { days: 30, label: "30 днів" },
  { days: 90, label: "3 місяці" },
  { days: 365, label: "Рік" },
] as const;

/** За замовчуванням — останній місяць: саме його зазвичай і звіряють */
export function defaultPeriod(): Period {
  return { from: shiftDays(-30), to: iso(new Date()) };
}

export function presetPeriod(days: number): Period {
  return { from: shiftDays(-days), to: iso(new Date()) };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Читає межі з query. Усе, що не схоже на дату, відкидаємо: інакше
 * `between` отримав би сміття і бекенд відповів би помилкою замість даних.
 */
export function readPeriod(sp: Record<string, string | string[] | undefined>) {
  const one = (key: string) => {
    const v = sp[key];
    const s = typeof v === "string" ? v : undefined;
    return s && DATE.test(s) ? s : undefined;
  };

  const fallback = defaultPeriod();
  return { from: one("from") ?? fallback.from, to: one("to") ?? fallback.to };
}

/** Чи дорівнює поточний період готовому набору — для підсвітки кнопки */
export function isPreset(period: Period, days: number) {
  const p = presetPeriod(days);
  return period.from === p.from && period.to === p.to;
}
