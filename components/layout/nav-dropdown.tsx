"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { NavLink } from "@/lib/site";

/**
 * Випадайка головного меню.
 *
 * Відкривається наведенням, як і раніше. Але самим CSS обійтися не
 * вийшло: меню трималось і на `group-focus-within`, а після кліку по
 * пункту фокус лишається на посиланні — шапка живе в кореневому layout
 * і при переході не перемонтовується. Тому меню не зникало.
 *
 * Тут клік гасить фокус і закриває панель до того, як курсор піде геть.
 */
export function NavDropdown({
  label,
  href,
  items,
}: {
  label: string;
  href?: string;
  items: NavLink[];
}) {
  const [closed, setClosed] = useState(false);

  /* Панель лишається закритою, доки курсор не покине пункт меню —
     інакше вона відкривалась би знову одразу після переходу */
  const close = (event: React.MouseEvent<HTMLElement>) => {
    setClosed(true);
    event.currentTarget.blur();
  };

  return (
    <div
      className="group relative"
      onMouseLeave={() => setClosed(false)}
      onBlur={(e) => {
        /* Пішли з меню клавіатурою — повертаємо його в робочий стан */
        if (!e.currentTarget.contains(e.relatedTarget)) setClosed(false);
      }}
    >
      <Link
        href={href ?? "#"}
        onClick={close}
        className="inline-flex items-center gap-1 text-[16px] font-medium leading-[1.5] text-black-900 transition-colors group-hover:text-blue-300 group-focus-within:text-blue-300"
      >
        {label}
        <ChevronDownIcon
          className={cn(
            "size-5 shrink-0 transition-transform duration-200",
            !closed && "group-hover:rotate-180",
          )}
        />
      </Link>

      <div
        className={cn(
          "invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-3 opacity-0 transition-[opacity,transform] duration-150",
          /* Коли закрито — просто не додаємо правил відкриття: так не
             доводиться перебивати їх через !important */
          !closed &&
            "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
        )}
      >
        <div className="rounded-[12px] border border-grey-200 bg-white p-1.5 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="block rounded-[8px] px-3 py-2 transition-colors hover:bg-blue-25"
            >
              <span className="block text-[15px] font-semibold text-black-900">
                {item.label}
              </span>
              {item.note && (
                <span className="mt-0.5 block text-[13px] leading-snug text-grey-600">
                  {item.note}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
