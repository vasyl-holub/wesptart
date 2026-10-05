"use client";

import { useId } from "react";

export type Range = { min: number; max: number };

/**
 * Два повзунки на спільній доріжці плюс числові поля, як у макеті.
 * Нативні input[type=range] лежать один поверх одного: так лишається
 * керування з клавіатури й доступність, яких не дає доріжка на div-ах.
 */
export function RangeFilter({
  label,
  bounds,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  bounds: Range;
  value: Range;
  onChange: (next: Range) => void;
  step?: number;
}) {
  const id = useId();

  /* Межі можуть схлопнутись: якщо в усіх пропозицій однаковий залишок,
     min і max рівні. Тоді діапазон не має сенсу — показуємо лише поля,
     а доріжку ховаємо, інакше ділення на нуль рознесло б розмітку. */
  const collapsed = bounds.max <= bounds.min;
  const span = bounds.max - bounds.min || 1;

  const clamp = (n: number) =>
    Number.isFinite(n)
      ? Math.min(bounds.max, Math.max(bounds.min, n))
      : bounds.min;

  /* Відсотки рахуємо вже за обмеженими значеннями, тож заливка доріжки
     фізично не може вилізти за її краї */
  const left = ((clamp(value.min) - bounds.min) / span) * 100;
  const right = ((clamp(value.max) - bounds.min) / span) * 100;

  /* Повзунки не перестрибують один одного й не виходять за межі */
  const setMin = (n: number) =>
    onChange({ min: Math.min(clamp(n), value.max), max: value.max });
  const setMax = (n: number) =>
    onChange({ min: value.min, max: Math.max(clamp(n), value.min) });

  /* Поки поле порожнє, не підставляємо нуль — інакше неможливо стерти
     значення й надрукувати нове */
  const read = (raw: string, fallback: number) =>
    raw.trim() === "" ? fallback : Number(raw);

  const field =
    "h-10 w-full min-w-0 rounded-[8px] border border-grey-300 bg-white px-3 text-center " +
    "text-[14px] leading-[1.5] text-black-900 outline-none transition-colors " +
    "focus:border-blue-300 disabled:cursor-not-allowed disabled:bg-grey-100 disabled:text-grey-600";
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-300 [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none " +
    "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-300 " +
    "focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-blue-300/40";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] leading-[1.5] text-grey-700">{label}</span>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`${id}-min`}>
          {label}, від
        </label>
        <input
          id={`${id}-min`}
          type="number"
          inputMode="numeric"
          className={`tnum ${field}`}
          value={value.min}
          min={bounds.min}
          max={bounds.max}
          disabled={collapsed}
          onChange={(e) => setMin(read(e.target.value, bounds.min))}
          onBlur={(e) => setMin(read(e.target.value, bounds.min))}
        />
        <span className="shrink-0 text-grey-300">—</span>
        <label className="sr-only" htmlFor={`${id}-max`}>
          {label}, до
        </label>
        <input
          id={`${id}-max`}
          type="number"
          inputMode="numeric"
          className={`tnum ${field}`}
          value={value.max}
          min={bounds.min}
          max={bounds.max}
          disabled={collapsed}
          onChange={(e) => setMax(read(e.target.value, bounds.max))}
          onBlur={(e) => setMax(read(e.target.value, bounds.max))}
        />
      </div>

      {!collapsed && (
        <div className="relative h-4 overflow-hidden">
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-grey-200" />
          <span
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-300"
            style={{ left: `${left}%`, right: `${100 - right}%` }}
          />
          <input
            type="range"
            aria-label={`${label}, від`}
            className={thumb}
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={value.min}
            onChange={(e) => setMin(Number(e.target.value))}
          />
          <input
            type="range"
            aria-label={`${label}, до`}
            className={thumb}
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={value.max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
