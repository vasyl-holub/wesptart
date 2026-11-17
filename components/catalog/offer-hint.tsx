"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Підказка біля значків у таблиці пропозицій: фото, характеристики,
 * застосовність. Показується наведенням, щоб не йти на сторінку товару
 * заради одного погляду.
 *
 * Малюємо через портал у `body`, а не поруч із тригером: таблиця лежить
 * у контейнері з горизонтальною прокруткою, а він обрізає все, що з
 * нього виходить — підказка всередині була б підрізана знизу.
 */
export function OfferHint({
  label,
  children,
  content,
}: {
  /** Підпис для читалок і для `title` */
  label: string;
  /** Сам значок */
  children: React.ReactNode;
  /** Вміст підказки; `null` — показувати нічого */
  content: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const el = ref.current;
    if (!el || !content) return;

    const r = el.getBoundingClientRect();
    /* Координати viewport — підказка на position: fixed, тому прокрутку
       сторінки додавати не треба */
    setBox({ top: r.bottom + 8, left: r.left + r.width / 2 });
  };

  const hide = () => setBox(null);

  /* Прокрутка зміщує тригер, а підказка лишалась би на місці */
  useEffect(() => {
    if (!box) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [box]);

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="inline-flex"
    >
      {children}

      {box &&
        content &&
        createPortal(
          <div
            role="tooltip"
            aria-label={label}
            /* -translate-x-1/2 центрує картку під значком; клік крізь неї
               не потрібен, тому події миші не перехоплюємо */
            style={{ top: box.top, left: box.left }}
            className="pointer-events-none fixed z-[100] w-[260px] -translate-x-1/2 rounded-[12px] border border-grey-200 bg-white p-3 shadow-lg"
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
