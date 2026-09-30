import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Скільки номерів показуємо обабіч поточної сторінки */
const AROUND = 1;

/** Номери з трикрапками: 1 … 4 5 6 … 20 */
function pageList(current: number, total: number) {
  const out: (number | "gap")[] = [];
  let last = 0;

  for (let p = 1; p <= total; p++) {
    const keep =
      p === 1 ||
      p === total ||
      (p >= current - AROUND && p <= current + AROUND);
    if (!keep) continue;
    if (last && p - last > 1) out.push("gap");
    out.push(p);
    last = p;
  }

  return out;
}

const item =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-[8px] px-3 text-[15px] font-semibold leading-[1.5] transition-colors";
const plain = "border border-grey-200 text-black-900 hover:border-blue-300";

export function Pagination({
  current,
  total,
  hrefFor,
}: {
  current: number;
  /** Загальна кількість сторінок */
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;

  return (
    <nav aria-label="Сторінки" className="flex flex-wrap items-center gap-2">
      {current > 1 && (
        <Link
          href={hrefFor(current - 1)}
          rel="prev"
          aria-label="Попередня сторінка"
          className={`${item} ${plain}`}
        >
          <ChevronRightIcon className="size-5 rotate-180" />
        </Link>
      )}

      {pageList(current, total).map((p, i) =>
        p === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-[15px] text-grey-600"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(
              item,
              "tnum",
              p === current ? "bg-blue-300 text-white" : plain,
            )}
          >
            {p}
          </Link>
        ),
      )}

      {current < total && (
        <Link
          href={hrefFor(current + 1)}
          rel="next"
          aria-label="Наступна сторінка"
          className={`${item} ${plain}`}
        >
          <ChevronRightIcon className="size-5" />
        </Link>
      )}
    </nav>
  );
}
