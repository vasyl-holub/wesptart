"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import type { OrderComment } from "@/lib/api/orders";
import { formatDateTime } from "@/lib/format-date";
import { pluralize } from "@/lib/plural";
import { cn } from "@/lib/cn";

/**
 * Значок листування біля замовлення: кількість видно одразу, зміст —
 * при наведенні або натисканні.
 *
 * Клік потрібен не лише для сенсорних екранів: наведення не лишає
 * списку відкритим, а з нього інколи треба скопіювати номер накладної
 * чи назву деталі.
 */
export function OrderComments({ comments }: { comments: OrderComment[] }) {
  const [open, setOpen] = useState(false);
  /* Наведення й клік керують однією панеллю, тож тримаємо їх окремо:
     інакше відведення миші закривало б те, що відкрили кліком */
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setPinned(false);
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setPinned(false);
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (comments.length === 0) return null;

  const shown = open || pinned;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setPinned((v) => !v)}
        aria-expanded={shown}
        aria-label={`${comments.length} ${pluralize(
          comments.length,
          "коментар",
          "коментарі",
          "коментарів",
        )} до замовлення`}
        className={cn(
          "flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[14px] font-semibold leading-[1.5] transition-colors",
          shown
            ? "border-blue-300 text-blue-300"
            : "border-grey-200 text-grey-700 hover:border-blue-300 hover:text-blue-300",
        )}
      >
        <MessageSquareText className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="tnum">{comments.length}</span>
      </button>

      {shown && (
        <div
          role="group"
          aria-label="Листування щодо замовлення"
          className="absolute right-0 top-full z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-[12px] border border-grey-200 bg-white p-3 shadow-lg sm:w-[380px]"
        >
          <ul className="scrollbar-thin flex max-h-[320px] flex-col gap-2.5 overflow-y-auto">
            {comments.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "flex flex-col gap-1 rounded-[8px] px-3 py-2",
                  c.own ? "border border-grey-200" : "bg-blue-25",
                )}
              >
                <span className="text-[13px] leading-[1.45] text-grey-600">
                  {c.author} · {formatDateTime(c.created)}
                </span>
                <span className="whitespace-pre-line text-[14px] leading-[1.5] text-black-900">
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
