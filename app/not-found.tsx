import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SearchIcon } from "@/components/ui/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Сторінку не знайдено",
  robots: { index: false, follow: true },
};

const shortcuts = [
  {
    href: "/catalog",
    label: "Каталог брендів",
    note: "Polcar, Signeda, NTY, DEPO, SRLine",
  },
  {
    href: "/requests/create",
    label: "Підбір по VIN",
    note: "Не знаєте артикул — підберемо ми",
  },
  {
    href: "/delivery",
    label: "Доставка і оплата",
    note: "Строки, тарифи, способи оплати",
  },
  {
    href: "/contacts",
    label: "Контакти",
    note: "Телефони, адреси, графік роботи",
  },
];

export default function NotFound() {
  return (
    <section className="pb-12 pt-6 lg:pb-20">
      <Container className="flex flex-col items-start gap-8">
        <div className="flex max-w-[640px] flex-col gap-4">
          <span className="tnum text-[64px] font-semibold leading-[1] text-blue-50 lg:text-[88px]">
            404
          </span>
          <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[36px]">
            Такої сторінки немає
          </h1>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Можливо, адреса застаріла після оновлення сайту або в посиланні
            помилка. Спробуйте знайти деталь за артикулом чи OEM-номером — або
            почніть з каталогу.
          </p>
        </div>

        <form
          action="/search"
          className="flex w-full max-w-[560px] flex-col gap-2.5 sm:flex-row"
        >
          <label className="sr-only" htmlFor="notfound-search">
            Артикул або OEM-номер
          </label>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-grey-600" />
            <input
              id="notfound-search"
              type="search"
              name="q"
              placeholder="Артикул або OEM-номер"
              className="h-12 w-full rounded-[8px] border border-grey-300 pl-11 pr-4 text-[16px] leading-[1.5] text-black-900 outline-none transition-colors placeholder:text-grey-600 focus:border-blue-300"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-[8px] bg-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
          >
            Знайти
          </button>
        </form>

        <ul className="grid w-full gap-4 sm:grid-cols-2">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="flex h-full flex-col gap-1 rounded-[16px] border border-grey-200 p-5 transition-colors hover:border-blue-300"
              >
                <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
                  {s.label}
                </span>
                <span className="text-[14px] leading-[1.5] text-grey-700">
                  {s.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-[14px] leading-[1.5] text-grey-700">
          Не знайшли потрібне — телефонуйте{" "}
          <a
            href={site.phoneHref}
            className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
          >
            {site.phone}
          </a>
          . {site.replyTime}.
        </p>
      </Container>
    </section>
  );
}
