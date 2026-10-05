"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Select } from "@/components/ui/field";
import { ChevronDownIcon } from "@/components/ui/icons";
import { OffersTable, type OfferRow } from "@/components/catalog/offers-table";
import { RangeFilter, type Range } from "@/components/catalog/range-filter";

const ANALOGUES_STEP = 8;

function bounds(values: number[], fallback: Range): Range {
  const clean = values.filter((v) => Number.isFinite(v));
  if (!clean.length) return fallback;
  return {
    min: Math.floor(Math.min(...clean)),
    max: Math.ceil(Math.max(...clean)),
  };
}

/** «3-4 дн.» -> 4: для фільтра беремо найгірший зі строків */
function daysOf(text: string | null): number | null {
  if (!text) return null;
  const nums = text.match(/\d+/g);
  if (!nums) return null;
  return Math.max(...nums.map(Number));
}

export function PartOffers({
  variants,
  analogues,
}: {
  variants: OfferRow[];
  analogues: OfferRow[];
}) {
  const all = useMemo(() => [...variants, ...analogues], [variants, analogues]);

  const priceBounds = useMemo(
    () =>
      bounds(
        all.map((r) => r.price ?? NaN),
        { min: 0, max: 0 },
      ),
    [all],
  );
  const countBounds = useMemo(
    () =>
      bounds(
        all.map((r) => r.count ?? NaN),
        { min: 0, max: 0 },
      ),
    [all],
  );
  const dayBounds = useMemo(
    () =>
      bounds(
        all.map((r) => daysOf(r.deliveryDays) ?? NaN),
        { min: 0, max: 0 },
      ),
    [all],
  );

  const brands = useMemo(
    () => [...new Set(all.map((r) => r.brand).filter(Boolean))] as string[],
    [all],
  );
  const names = useMemo(
    () => [...new Set(all.map((r) => r.name).filter(Boolean))],
    [all],
  );

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<Range>(priceBounds);
  const [count, setCount] = useState<Range>(countBounds);
  const [days, setDays] = useState<Range>(dayBounds);
  const [hideAnalogues, setHideAnalogues] = useState(false);
  /* За замовчуванням обрана та сама пропозиція, що й у блоці купівлі
     вгорі сторінки — найдешевша доступна */
  const [selected, setSelected] = useState(() => {
    const buyable = variants.filter((v) => v.canBuy && (v.count ?? 0) > 0);
    const best = [...buyable].sort(
      (a, b) => (a.price ?? 0) - (b.price ?? 0),
    )[0];
    return (best ?? variants[0])?.key ?? "";
  });
  const [shown, setShown] = useState(ANALOGUES_STEP);

  const dirty =
    brand !== "" ||
    name !== "" ||
    price.min !== priceBounds.min ||
    price.max !== priceBounds.max ||
    count.min !== countBounds.min ||
    count.max !== countBounds.max ||
    days.min !== dayBounds.min ||
    days.max !== dayBounds.max;

  const reset = () => {
    setBrand("");
    setName("");
    setPrice(priceBounds);
    setCount(countBounds);
    setDays(dayBounds);
  };

  const apply = (rows: OfferRow[]) =>
    rows.filter((r) => {
      if (brand && r.brand !== brand) return false;
      if (name && r.name !== name) return false;
      if (r.price !== null && (r.price < price.min || r.price > price.max))
        return false;
      const c = r.count ?? 0;
      if (c < count.min || c > count.max) return false;
      const d = daysOf(r.deliveryDays);
      if (d !== null && (d < days.min || d > days.max)) return false;
      return true;
    });

  const shownVariants = apply(variants);
  const shownAnalogues = hideAnalogues ? [] : apply(analogues);
  const visibleAnalogues = shownAnalogues.slice(0, shown);

  const label = "text-[14px] leading-[1.5] text-grey-700";

  return (
    /* Верхнього відступу немає: секція товару вище вже має свій нижній,
       і два разом утворювали зайвий просвіт перед фільтрами */
    <section className="pb-12 lg:pb-16">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900">
              Фільтри
            </h2>
            {dirty && (
              <button
                type="button"
                onClick={reset}
                className="flex h-9 items-center gap-1.5 rounded-[8px] border border-danger-700 px-3 text-[14px] font-medium leading-[1.5] text-danger-700 transition-colors hover:bg-danger-50"
              >
                Очистити всі
                <span aria-hidden>&times;</span>
              </button>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="flex flex-col gap-2">
              <span className={label}>Виробник</span>
              <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">Усі</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className={label}>Назва запчастини</span>
              <Select value={name} onChange={(e) => setName(e.target.value)}>
                <option value="">Усі</option>
                {names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>

            <RangeFilter
              label="Днів"
              bounds={dayBounds}
              value={days}
              onChange={setDays}
            />
            <RangeFilter
              label="Кількість"
              bounds={countBounds}
              value={count}
              onChange={setCount}
            />
            <RangeFilter
              label="Ціна"
              bounds={priceBounds}
              value={price}
              onChange={setPrice}
            />

            <div className="flex flex-col gap-2">
              <span className={label}>Валюта</span>
              {/* Бекенд віддає ціни лише в гривні, тому вибір один */}
              <Select defaultValue="UAH" disabled>
                <option value="UAH">UAH</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900">
              Варіанти поставки
            </h2>
            <p className="text-[16px] leading-[1.5] text-grey-700">
              Один товар — різні терміни та ціни
            </p>
          </div>

          {shownVariants.length ? (
            <OffersTable
              rows={shownVariants}
              selectedKey={selected}
              onSelect={setSelected}
            />
          ) : (
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Під вибрані умови не підійшла жодна пропозиція.
            </p>
          )}
        </div>

        {analogues.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900">
                  Аналоги
                </h2>
                <p className="text-[16px] leading-[1.5] text-grey-700">
                  Інші виробники та альтернативні артикули
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHideAnalogues((v) => !v)}
                aria-expanded={!hideAnalogues}
                className="flex h-10 items-center gap-1.5 rounded-[8px] border border-blue-300 px-4 text-[14px] font-medium leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
              >
                {hideAnalogues ? "Показати аналоги" : "Показати без аналогів"}
                <ChevronDownIcon
                  className={`size-5 shrink-0 transition-transform ${
                    hideAnalogues ? "" : "rotate-180"
                  }`}
                />
              </button>
            </div>

            {!hideAnalogues && <OffersTable rows={visibleAnalogues} />}

            {!hideAnalogues &&
              shownAnalogues.length > visibleAnalogues.length && (
                <button
                  type="button"
                  onClick={() => setShown((n) => n + ANALOGUES_STEP)}
                  className="mx-auto flex h-12 items-center gap-1.5 rounded-[8px] border border-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
                >
                  Показати більше аналогів
                  <ChevronDownIcon className="size-5 shrink-0" />
                </button>
              )}
          </div>
        )}
      </Container>
    </section>
  );
}
