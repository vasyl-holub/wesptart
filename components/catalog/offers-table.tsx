"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { OfferHint } from "@/components/catalog/offer-hint";
import { CarFitsButton } from "@/components/catalog/car-fits-button";
import { AddToCartDialog } from "@/components/catalog/add-to-cart-dialog";
import {
  CameraIcon,
  CartIcon,
  CircleCheckIcon,
  GoogleMark,
  InfoCircleIcon,
} from "@/components/ui/icons";
import { formatMoney } from "@/lib/cn";

/** Один рядок таблиці: і власна пропозиція складу, і товар-аналог */
export type OfferRow = {
  key: string;
  offerId: string;
  /** Товар, якому належить пропозиція — за ним тягнемо застосовність */
  productId: string;
  brand: string | null;
  num: string;
  name: string;
  quality: string | null;
  deliveryDays: string | null;
  count: number | null;
  price: number | null;
  canBuy: boolean;
  image: string | null;
  /** Характеристики — для підказок біля значків */
  specs?: { label: string; value: string }[];
  /** Є лише в аналогів — рядок веде на сторінку того товару */
  href?: string;
};

/** Підпис товару для заголовків вікон і запиту в Google */
function label(row: OfferRow) {
  return [row.brand, row.num].filter(Boolean).join(" ");
}

/**
 * Пошук фото в Google.
 *
 * Своє фото є не в кожного артикула — у бюджетних брендів його часто
 * немає зовсім. Тягнути чуже зображення до себе не можна: права чужі, а
 * видача по артикулу легко підсуне іншу деталь. Тому не підставляємо
 * картинку, а даємо подивитись першоджерело: `udm=2` — вкладка «Фото».
 */
function GooglePhotoLink({ row }: { row: OfferRow }) {
  const query = label(row);

  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(query)}&udm=2`}
      target="_blank"
      rel="noopener noreferrer"
      /* Рядок таблиці клікабельний — без цього клік ще й перемикав би
         обрану пропозицію */
      onClick={(e) => e.stopPropagation()}
      aria-label={`Шукати фото ${query} в Google`}
      title="Шукати фото в Google"
      className="inline-flex transition-opacity hover:opacity-70"
    >
      <GoogleMark className="size-5" />
    </a>
  );
}

/** Короткий перелік характеристик для підказки */
function SpecList({ specs }: { specs: OfferRow["specs"] }) {
  const rows = (specs ?? []).filter(
    (s) => !s.label.toLowerCase().startsWith("модель"),
  );
  if (!rows.length) return null;

  return (
    <dl className="flex flex-col gap-1.5">
      {rows.slice(0, 6).map((s) => (
        <div key={s.label} className="flex gap-2 text-[13px] leading-[1.45]">
          <dt className="shrink-0 text-grey-600">{s.label}</dt>
          <dd className="ml-auto text-right font-medium text-black-900">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export const offersColumns = [
  "Фото",
  "Виробник",
  "Артикул",
  "Назва",
  "Якість",
  "",
  "Доставка",
  "Наявність",
  "Ціна",
  "Дія",
];

function AddButton({ row, wide }: { row: OfferRow; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  /* Одразу класти одну штуку не можна: у таблиці поруч кілька складів із
     різними залишками, і кількість тут вирішує. Тому значок відкриває
     вікно, а додає вже воно. */
  return (
    <>
      <button
        type="button"
        aria-label={`Додати в кошик: ${row.brand ?? ""} ${row.num}`}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 transition-colors ${
          wide
            ? "h-11 rounded-[8px] px-5 text-[15px] font-semibold leading-[1.5]"
            : "size-10 rounded-full"
        } ${
          added
            ? "bg-green-300 text-white"
            : "bg-blue-300 text-white hover:bg-blue-700"
        }`}
      >
        {added ? (
          <CircleCheckIcon className="size-6" />
        ) : (
          <CartIcon className="size-6" strokeWidth={2} />
        )}
        {wide && <span>{added ? "Додано" : "У кошик"}</span>}
      </button>

      {open && (
        <AddToCartDialog
          row={row}
          onClose={() => setOpen(false)}
          onAdded={() => setAdded(true)}
        />
      )}
    </>
  );
}

/** Та сама пропозиція для вузького екрана: таблиця там не читається */
function OfferCard({
  row: r,
  selected,
  onSelect,
}: {
  row: OfferRow;
  selected: boolean;
  onSelect?: () => void;
}) {
  const inStock = (r.count ?? 0) > 0;

  return (
    <li
      /* aria-current замість aria-selected: списковий елемент другого не
         підтримує. Клавіатуру додаємо так само, як рядкам таблиці —
         інакше вибір пропозиції працював би тільки мишею. */
      aria-current={onSelect && selected ? "true" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={
        selected
          ? "flex flex-col gap-3 rounded-[12px] border border-blue-300 bg-[#eaf4ff] p-4"
          : `flex flex-col gap-3 rounded-[12px] border border-grey-200 p-4 ${
              onSelect
                ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-300"
                : ""
            }`
      }
    >
      <div className="flex gap-3">
        <span className="block size-14 shrink-0 overflow-hidden rounded-[6px] border border-grey-200 bg-white">
          <ProductPhoto
            sources={r.image ? [r.image] : []}
            alt=""
            article={r.num}
            width={56}
            height={56}
            className="size-full object-contain p-1"
            placeholderIconClassName="size-5"
          />
        </span>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[15px] leading-[1.45] text-black-900">
            {r.href ? (
              <Link href={r.href} className="hover:text-blue-300">
                {r.name || "—"}
              </Link>
            ) : (
              r.name || "—"
            )}
          </span>
          <span className="tnum text-[13px] leading-[1.45] text-grey-600">
            {[r.brand, r.num].filter(Boolean).join(" · ")}
          </span>

          {/* Ті самі значки, що й у таблиці: на телефоні колонка з ними
              не поміщалась, а застосовність і фото потрібні й тут */}
          <span
            className="mt-0.5 flex items-center gap-3 text-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CarFitsButton productId={r.productId} title={label(r)} />
            {/* Фото тут видно одразу, тож Google потрібен лише коли
                свого фото немає */}
            {!r.image && <GooglePhotoLink row={r} />}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
        {[
          { label: "Якість", value: r.quality ?? "—" },
          { label: "Доставка", value: r.deliveryDays ?? "—" },
          { label: "Наявність", value: inStock ? `${r.count} шт` : "немає" },
        ].map(({ label, value }) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-[12px] leading-[1.4] text-grey-600">{label}</dt>
            <dd className="truncate text-[14px] leading-[1.45] text-black-900">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Ціна й кнопка — те, заради чого сюди дивляться, тому вони внизу
          поруч, а не за 900 пікселів прокрутки вбік, як було в таблиці */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-grey-200 pt-3">
        <span className="tnum text-[18px] font-semibold leading-[1.4] text-blue-300">
          {r.price === null ? "—" : formatMoney(r.price)}
        </span>

        {r.canBuy && inStock && r.offerId ? (
          <AddButton row={r} wide />
        ) : (
          <span className="text-[14px] leading-[1.45] text-grey-600">
            немає в наявності
          </span>
        )}
      </div>
    </li>
  );
}

export function OffersTable({
  rows,
  selectedKey,
  onSelect,
}: {
  rows: OfferRow[];
  /** Підсвічений рядок — обрана пропозиція, а не просто перша */
  selectedKey?: string;
  /** Передають лише для «Варіантів поставки»: аналоги це інші товари,
      їх не обирають, на них переходять */
  onSelect?: (key: string) => void;
}) {
  if (!rows.length) return null;

  return (
    <>
      {/* Десять колонок у телефон не влазять, а гортання вбік ховало
          найпотрібніше — ціну й кнопку — у кінці рядка. Тому до lg той
          самий список іде картками. */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {rows.map((r) => (
          <OfferCard
            key={r.key}
            row={r}
            selected={r.key === selectedKey}
            onSelect={onSelect ? () => onSelect(r.key) : undefined}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr>
              {offersColumns.map((c, i) => (
                <th
                  key={c || `col-${i}`}
                  scope="col"
                  className="whitespace-nowrap px-3 pb-3 text-[14px] font-semibold leading-[1.5] text-black-900 first:pl-0 last:pr-0 last:text-right"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const selected = r.key === selectedKey;
              return (
                <tr
                  key={r.key}
                  aria-selected={onSelect ? selected : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  onClick={onSelect ? () => onSelect(r.key) : undefined}
                  onKeyDown={
                    onSelect
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(r.key);
                          }
                        }
                      : undefined
                  }
                  /* Рядків багато й вони вузькі — підсвітка на ховері не дає
                 зчитати ціну з одного рядка, а строк поставки з сусіднього */
                  className={
                    selected
                      ? "bg-[#eaf4ff] transition-colors hover:bg-[#dbe9f8] [&>td:first-child]:rounded-l-[8px] [&>td:last-child]:rounded-r-[8px]"
                      : `border-t border-grey-200 transition-colors hover:bg-grey-100 ${
                          onSelect
                            ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-300"
                            : ""
                        }`
                  }
                >
                  <td className="px-3 py-3 first:pl-3">
                    <span className="block size-12 overflow-hidden rounded-[4px] border border-grey-200 bg-white">
                      <ProductPhoto
                        sources={r.image ? [r.image] : []}
                        alt=""
                        article={r.num}
                        width={48}
                        height={48}
                        className="size-full object-contain p-1"
                        placeholderIconClassName="size-5"
                      />
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                    {r.brand ?? "—"}
                  </td>

                  <td className="tnum whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                    {r.num}
                  </td>

                  <td className="min-w-[180px] px-3 py-3 text-[14px] leading-[1.5] text-black-900">
                    {r.href ? (
                      <Link
                        href={r.href}
                        className="transition-colors hover:text-blue-300"
                      >
                        {r.name || "—"}
                      </Link>
                    ) : (
                      r.name || "—"
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                    {r.quality ?? "—"}
                  </td>

                  {/* Наведення показує підказку, клік і далі веде на
                      товар: щоб глянути фото чи характеристики, більше не
                      треба перезавантажувати сторінку */}
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2 text-blue-300">
                      <OfferHint
                        label="Характеристики"
                        content={<SpecList specs={r.specs} />}
                      >
                        <Link
                          href={r.href ? r.href : "#specs"}
                          aria-label="Характеристики"
                          className="transition-opacity hover:opacity-70"
                        >
                          <InfoCircleIcon className="size-5" />
                        </Link>
                      </OfferHint>

                      {/* Одне місце — два стани: своє фото показуємо
                          фотоапаратом, а коли його немає, замість нього
                          стає Google. Так робив і старий кабінет. */}
                      {r.image ? (
                        <OfferHint
                          label="Фото товару"
                          content={
                            <span className="flex flex-col gap-2">
                              <span className="block overflow-hidden rounded-[8px] border border-grey-200 bg-white">
                                <ProductPhoto
                                  sources={[r.image]}
                                  alt=""
                                  article={r.num}
                                  width={232}
                                  height={232}
                                  className="h-[232px] w-full object-contain"
                                  placeholderIconClassName="size-8"
                                />
                              </span>
                              <span className="tnum text-[13px] leading-[1.45] text-grey-600">
                                {[r.brand, r.num].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                          }
                        >
                          <Link
                            href={r.href ? r.href : "#gallery"}
                            aria-label="Фото товару"
                            className="transition-opacity hover:opacity-70"
                          >
                            <CameraIcon className="size-5" />
                          </Link>
                        </OfferHint>
                      ) : (
                        <GooglePhotoLink row={r} />
                      )}

                      <CarFitsButton productId={r.productId} title={label(r)} />
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-[14px] leading-[1.5] text-grey-700">
                    {r.deliveryDays ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="flex items-center gap-1.5 text-[14px] leading-[1.5] text-black-900">
                      {(r.count ?? 0) > 0 && (
                        <CircleCheckIcon className="size-5 shrink-0 text-green-300" />
                      )}
                      <span className="tnum">{r.count ?? 0}</span>
                    </span>
                  </td>

                  <td className="tnum whitespace-nowrap px-3 py-3 text-[14px] font-semibold leading-[1.5] text-blue-300">
                    {r.price === null ? "—" : formatMoney(r.price)}
                  </td>

                  <td className="px-3 py-3 text-right last:pr-3">
                    {r.canBuy && (r.count ?? 0) > 0 && r.offerId ? (
                      <AddButton row={r} />
                    ) : (
                      <span className="text-[13px] leading-[1.4] text-grey-600">
                        немає
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
