import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Хлібні крихти" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[16px] leading-[1.5]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={`${item.label}-${i}`}
              className="flex items-center gap-2.5"
            >
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-blue-300 transition-opacity hover:opacity-80"
                >
                  {/* Домівка позначена іконкою тільки в першій крихті */}
                  {i === 0 && <HomeIcon className="size-5 shrink-0" />}
                  {item.label}
                </Link>
              ) : (
                /* Назва статті чи товару буває довшою за рядок — обрізаємо.
                   Повний текст лишається у title і доступний скрінрідеру */
                <span
                  className={
                    last
                      ? "block max-w-[24ch] truncate text-grey-600 sm:max-w-[52ch]"
                      : "text-blue-300"
                  }
                  title={last ? item.label : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!last && (
                <ChevronRightIcon className="size-5 shrink-0 text-grey-600" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
