"use client";

import { useEffect, useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { CarFitsDialog } from "@/components/catalog/car-fits-button";
import { loadCarFits } from "@/lib/car-fits-client";
import type { CarFits } from "@/lib/api/car-fits";

/**
 * Картка «Підходить для» на сторінці товару.
 *
 * Перелік тягнемо з браузера, а не разом зі сторінкою: у ходових деталей
 * він сягає півтори тисячі модифікацій, і сторінка чекала б на нього
 * дарма. Поки їде — показуємо те, що й раніше: характеристику «Модель».
 * Тому картка не стрибає й не з'являється з порожнечі.
 */
export function PartFitsCard({
  productId,
  title,
  fallback,
  className,
  titleClassName,
  linkClassName,
}: {
  productId: string;
  /** Виробник і артикул — у заголовку вікна */
  title: string;
  /** Характеристика «Модель»: нею жили, доки не знайшовся `product.cars` */
  fallback: string | null;
  className: string;
  titleClassName: string;
  linkClassName: string;
}) {
  const [fits, setFits] = useState<CarFits | null>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadCarFits(productId, true).then((data) => {
      if (alive) setFits(data);
    });
    return () => {
      alive = false;
    };
  }, [productId]);

  const has = Boolean(fits && fits.total > 0);

  return (
    <div className={className}>
      <h2 className={titleClassName}>Підходить для:</h2>

      <p className="text-[16px] leading-[1.5] text-grey-700">
        {has
          ? fits!.summary
          : /* API віддає характеристику одним рядком, а не списком авто:
               ділити його комами не можна — у «SKODA OCTAVIA, 13 - 17»
               кома відділяє роки, а не другу модель */
            (fallback ??
            (fits === undefined
              ? "Завантажуємо перелік…"
              : "Перелік авто уточнюйте в менеджера"))}
      </p>

      {has && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${linkClassName} mt-auto`}
        >
          Переглянути всі сумісні авто ({fits!.total})
          <ChevronRightIcon className="size-5 shrink-0" />
        </button>
      )}

      {open && (
        <CarFitsDialog
          productId={productId}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
