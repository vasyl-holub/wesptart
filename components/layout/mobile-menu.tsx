"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { mainNav } from "@/lib/site";
import {
  CartIcon,
  ChevronDownIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { Contacts } from "@/components/layout/contacts";

const circle =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-full transition-colors";
const primary = `${circle} bg-blue-300 text-white hover:bg-blue-700`;
const outline = `${circle} border border-grey-200 bg-white text-black-900 hover:border-blue-300 hover:text-blue-300`;

export function MobileMenu() {
  /* mounted — панель у DOM, shown — панель у відкритому стані.
     Два стани потрібні, щоб анімація встигла програтися і на закритті:
     спершу знімаємо shown, і аж після переходу прибираємо з DOM. */
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    /* Клас відкриття вішаємо наступним кадром — інакше браузер побачить
       кінцевий стан одразу при вставці й переходу не буде */
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShown(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setShown(false);
  const open = mounted;

  return (
    <>
      <button
        type="button"
        /* Якщо натиснути під час закривання — панель ще в DOM,
           тож просто вертаємо її у відкритий стан */
        onClick={() => (mounted ? setShown(true) : setMounted(true))}
        aria-expanded={shown}
        aria-label="Відкрити меню"
        className={`${primary} lg:hidden`}
      >
        <Menu className="size-6" strokeWidth={2} />
      </button>

      {open && (
        /* Меню займає весь екран, а не висувається збоку — як у макеті */
        <div
          onTransitionEnd={(e) => {
            /* Чекаємо саме на панель, а не на переходи всередині неї */
            if (e.target === e.currentTarget && !shown) setMounted(false);
          }}
          className={cn(
            "fixed inset-0 z-100 flex flex-col bg-white transition-opacity duration-200 ease-out lg:hidden",
            shown ? "opacity-100" : "opacity-0",
          )}
        >
          {/* Шапка панелі не рухається: вона лежить рівно на шапці сайту,
              і будь-який зсув під час згасання читався б як ривок */}
          <div className="flex h-[86px] shrink-0 items-center justify-between border-b border-grey-200 px-4">
            <Link href="/" onClick={close} aria-label="WestPart — головна">
              <Image
                src="/logo.svg"
                alt="WestPart"
                width={161}
                height={54}
                unoptimized
                className="h-[54px] w-auto"
              />
            </Link>

            <button
              type="button"
              onClick={close}
              aria-label="Закрити меню"
              className={primary}
            >
              <X className="size-6" strokeWidth={2} />
            </button>
          </div>

          {/* Рухається лише вміст під шапкою */}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col transition-transform duration-200 ease-out",
              shown ? "translate-y-0" : "-translate-y-2",
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4">
              <Contacts className="flex-col gap-3" />

              <div className="flex flex-col gap-2">
                <Link
                  href="/search"
                  onClick={close}
                  aria-label="Пошук"
                  className={primary}
                >
                  <SearchIcon className="size-6" />
                </Link>
                <Link
                  href="/cart"
                  onClick={close}
                  aria-label="Кошик"
                  className={outline}
                >
                  <CartIcon className="size-6" />
                </Link>
                <Link
                  href="/login"
                  onClick={close}
                  aria-label="B2B-кабінет"
                  className={outline}
                >
                  <UserIcon className="size-6" />
                </Link>
              </div>
            </div>

            <nav
              aria-label="Головна навігація"
              className="scrollbar-thin flex flex-1 flex-col items-center gap-5 overflow-y-auto border-t border-grey-200 px-4 py-6"
            >
              {mainNav.map((group) => {
                if (!group.items) {
                  return (
                    <Link
                      key={group.label}
                      href={group.href!}
                      onClick={close}
                      className="text-[16px] font-medium leading-[1.5] text-black-900 transition-colors hover:text-blue-300"
                    >
                      {group.label}
                    </Link>
                  );
                }

                const isOpen = expanded === group.label;
                return (
                  <div
                    key={group.label}
                    className="flex flex-col items-center gap-5"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : group.label)}
                      aria-expanded={isOpen}
                      className="flex items-center gap-1 text-[16px] font-medium leading-[1.5] text-black-900 transition-colors hover:text-blue-300"
                    >
                      {group.label}
                      <ChevronDownIcon
                        className={cn(
                          "size-5 shrink-0 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="flex flex-col items-center gap-4">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className="text-[16px] leading-[1.5] text-grey-700 transition-colors hover:text-blue-300"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
