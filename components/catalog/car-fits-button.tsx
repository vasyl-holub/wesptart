"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CarIcon } from "@/components/ui/icons";
import { OfferHint } from "@/components/catalog/offer-hint";
import type { CarFits } from "@/lib/api/car-fits";
import { loadCarFits } from "@/lib/car-fits-client";

/**
 * Значок «на які авто підходить».
 *
 * Наведення показує коротку відповідь, клік — повний перелік, як у
 * старому кабінеті. Дані не їдуть разом зі сторінкою: у ходових деталей
 * застосовність сягає півтори тисячі рядків, а відкривають її одиниці.
 */
export function CarFitsButton({
  productId,
  title,
}: {
  productId: string;
  /** Виробник і артикул у заголовку вікна */
  title: string;
}) {
  const [summary, setSummary] = useState<CarFits | null>();
  const [open, setOpen] = useState(false);

  const hint = () => {
    void loadCarFits(productId, true).then(setSummary);
  };

  return (
    <>
      <OfferHint
        label="На які авто підходить"
        onShow={hint}
        content={
          <span className="flex flex-col gap-1">
            <span className="text-[12px] leading-[1.4] text-grey-600">
              Підходить на
            </span>
            <span className="text-[13px] leading-[1.5] text-black-900">
              {summary === undefined
                ? "Завантажуємо…"
                : summary && summary.total > 0
                  ? summary.summary
                  : "Перелік авто уточнюйте в менеджера"}
            </span>
            {summary && summary.total > 0 && (
              <span className="text-[12px] leading-[1.4] text-blue-300">
                Натисніть, щоб побачити всі {summary.total}
              </span>
            )}
          </span>
        }
      >
        <button
          type="button"
          aria-label="На які авто підходить"
          onMouseEnter={hint}
          onClick={(e) => {
            /* Рядок таблиці клікабельний — інакше разом із вікном
               перемикався б і вибір пропозиції */
            e.stopPropagation();
            setOpen(true);
          }}
          className="inline-flex transition-opacity hover:opacity-70"
        >
          <CarIcon className="size-5" />
        </button>
      </OfferHint>

      {open && (
        <CarFitsDialog
          productId={productId}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function CarFitsDialog({
  productId,
  title,
  onClose,
}: {
  productId: string;
  title: string;
  onClose: () => void;
}) {
  const [fits, setFits] = useState<CarFits | null>();
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    void loadCarFits(productId, false).then((data) => {
      if (alive) setFits(data);
    });
    return () => {
      alive = false;
    };
  }, [productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const needle = query.trim().toLowerCase();
  const brands = (fits?.brands ?? [])
    .map((b) => ({
      ...b,
      models: b.models.filter(
        (m) =>
          !needle ||
          `${b.brand} ${m.model}`.toLowerCase().includes(needle) ||
          m.rows.some((r) => r.name.toLowerCase().includes(needle)),
      ),
    }))
    .filter((b) => b.models.length > 0);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black-900/50 sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="На які авто підходить"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[20px] bg-white sm:rounded-[20px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-grey-200 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-[17px] font-semibold leading-[1.4] text-black-900">
              Підходить на
            </h2>
            <p className="tnum truncate text-[13px] leading-[1.45] text-grey-600">
              {title}
              {fits && fits.total > 0 && ` · ${fits.total} модифікацій`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-100 hover:text-black-900"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Перелік буває на сотні рядків, тому пошук тут не прикраса */}
        {fits && fits.total > 12 && (
          <div className="border-b border-grey-200 px-5 py-3">
            <label className="sr-only" htmlFor="car-fits-search">
              Пошук по марці, моделі або двигуну
            </label>
            <input
              id="car-fits-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Марка, модель або двигун"
              className="h-11 w-full rounded-[8px] border border-grey-300 px-4 text-[15px] leading-[1.5] text-black-900 outline-none transition-colors placeholder:text-grey-600 focus:border-blue-300"
            />
          </div>
        )}

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4">
          {fits === undefined && (
            <p className="text-[15px] leading-[1.5] text-grey-600">
              Завантажуємо перелік…
            </p>
          )}

          {fits !== undefined && !brands.length && (
            <p className="text-[15px] leading-[1.5] text-grey-700">
              {fits && fits.total > 0
                ? "За цим запитом нічого не знайшли."
                : "Для цього артикула перелік авто ще не заведено — уточніть у менеджера."}
            </p>
          )}

          {brands.map((b) => (
            <section key={b.brand} className="flex flex-col gap-2">
              <h3 className="text-[15px] font-semibold leading-[1.4] text-blue-300">
                {b.brand}
              </h3>

              <ul className="flex flex-col">
                {b.models.map((m) => (
                  <li
                    key={m.model}
                    className="flex flex-col gap-1 border-b border-grey-200 py-2.5 last:border-b-0 sm:flex-row sm:gap-4"
                  >
                    <span className="text-[14px] font-medium leading-[1.5] text-black-900 sm:w-[220px] sm:shrink-0">
                      {m.model}
                    </span>

                    <span className="flex min-w-0 flex-col gap-0.5">
                      {m.rows.map((r) => (
                        <span
                          key={`${r.name}|${r.years}|${r.power}`}
                          className="flex flex-wrap gap-x-3 text-[14px] leading-[1.5] text-grey-700"
                        >
                          <span className="text-black-900">{r.name}</span>
                          {r.years && <span className="tnum">{r.years}</span>}
                          {r.power && <span className="tnum">{r.power}</span>}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
