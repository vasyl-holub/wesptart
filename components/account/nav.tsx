"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/app/login/actions";
import { resetUserBadge } from "@/components/layout/user-button";
import {
  BellIcon,
  BoxIcon,
  CarIcon,
  ChartIcon,
  ClockIcon,
  HeartIcon,
  HomeIcon,
  TruckIcon,
  LogoutIcon,
  UserIcon,
  WalletIcon,
} from "@/components/ui/icons";
import type { IconProps } from "@/components/ui/icons";

type Leaf = { href: string; label: string };

type Section = {
  href: string;
  label: string;
  Icon: (props: IconProps) => React.ReactElement;
  /** Підпункти; у батька свого вмісту немає, він веде на перший із них */
  items?: Leaf[];
  /** Непрочитані повідомлення — єдине число, яке меню показує саме */
  badge?: number;
};

/* Структура за ТЗ. Кошик, запити на повернення, історія товарів і авто
   окремими пунктами не стоять: вони живуть усередині своїх розділів. */
const sections: Section[] = [
  { href: "/account", label: "Огляд", Icon: HomeIcon },
  {
    href: "/account/orders",
    label: "Замовлення",
    Icon: BoxIcon,
    items: [
      { href: "/account/orders", label: "Усі замовлення" },
      { href: "/account/orders/items", label: "Замовлені позиції" },
    ],
  },
  {
    href: "/account/payments",
    label: "Оплати",
    Icon: WalletIcon,
    items: [
      { href: "/account/payments", label: "Взаєморозрахунки" },
      { href: "/account/payments/statements", label: "Виписки" },
      { href: "/account/payments/notify", label: "Повідомити про оплату" },
    ],
  },
  { href: "/account/returns", label: "Повернення", Icon: TruckIcon },
  { href: "/account/garage", label: "Гараж", Icon: CarIcon },
  { href: "/account/favorites", label: "Обране", Icon: HeartIcon },
  { href: "/account/history", label: "Перегляди", Icon: ClockIcon },
  { href: "/account/stats", label: "Статистика", Icon: ChartIcon },
  { href: "/account/messages", label: "Повідомлення", Icon: BellIcon },
  { href: "/account/profile", label: "Профіль", Icon: UserIcon },
];

const row =
  "flex items-center gap-2.5 whitespace-nowrap rounded-[8px] transition-colors";
const rowSize =
  "h-11 px-4 text-[15px] leading-[1.5] lg:h-12 lg:px-5 lg:text-[16px]";
const idle = "text-grey-700 hover:bg-blue-25 hover:text-blue-300";
const current = "bg-blue-300 font-semibold text-white";

/**
 * Підсвічуємо той пункт, чия адреса — найдовший префікс поточної. Так
 * «Огляд» не горить на кожній вкладеній сторінці, а «Усі замовлення» не
 * сперечається із «Замовленими позиціями» за /account/orders/items.
 */
function useActiveHref(hrefs: string[]) {
  const pathname = usePathname();
  return hrefs
    .filter((h) => pathname === h || pathname.startsWith(`${h}/`))
    .sort((a, b) => b.length - a.length)[0];
}

function Badge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        "tnum ml-auto flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13px] font-semibold leading-none",
        active ? "bg-white text-blue-300" : "bg-danger-500 text-white",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AccountNav({ unread = 0 }: { unread?: number }) {
  const leaves = sections.flatMap((s) => s.items ?? [{ ...s }]);
  const activeHref = useActiveHref(leaves.map((l) => l.href));

  return (
    <nav aria-label="Розділи кабінету">
      {/* На мобільному вкладеності немає: там це стрічка з прокруткою, і
          підпункти стоять у ній рівноправно, інакше до «Виписок» не
          дістатись. На десктопі — звичайна бокова колонка з групами. */}
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {leaves.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={href === activeHref ? "page" : undefined}
              className={cn(row, rowSize, href === activeHref ? current : idle)}
            >
              {label}
              {href === "/account/messages" && unread > 0 && (
                <Badge count={unread} active={href === activeHref} />
              )}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="hidden lg:flex lg:flex-col lg:gap-1">
        {sections.map((section) => {
          const { href, label, Icon, items } = section;
          const badge = href === "/account/messages" ? unread : 0;
          /* Батько групи сам нічого не показує — підсвічуємо його, поки
             активний будь-який його підпункт */
          const groupActive = items
            ? items.some((i) => i.href === activeHref)
            : href === activeHref;

          return (
            <li key={href} className="flex flex-col gap-1">
              <Link
                href={items ? items[0].href : href}
                aria-current={!items && groupActive ? "page" : undefined}
                className={cn(
                  row,
                  rowSize,
                  items
                    ? groupActive
                      ? "font-semibold text-blue-300"
                      : "font-semibold text-black-900 hover:text-blue-300"
                    : groupActive
                      ? current
                      : idle,
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
                {badge > 0 && <Badge count={badge} active={groupActive} />}
              </Link>

              {items && (
                <ul className="flex flex-col gap-1 border-l border-grey-200 pl-3 ml-5">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          item.href === activeHref ? "page" : undefined
                        }
                        className={cn(
                          row,
                          "h-10 px-3 text-[15px] leading-[1.5]",
                          item.href === activeHref ? current : idle,
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}

        {/* Вихід — після розділювача, як просить ТЗ */}
        <li className="mt-2 border-t border-grey-200 pt-2">
          <form action={logoutAction} onSubmit={resetUserBadge}>
            <button
              type="submit"
              className={cn(
                row,
                rowSize,
                "w-full text-grey-700 hover:bg-danger-50 hover:text-danger-700",
              )}
            >
              <LogoutIcon className="size-5 shrink-0" />
              Вийти
            </button>
          </form>
        </li>
      </ul>

      {/* На мобільному вихід стоїть окремо під стрічкою — у ній він
          губився б між розділами */}
      <form
        action={logoutAction}
        onSubmit={resetUserBadge}
        className="mt-2 lg:hidden"
      >
        <button
          type="submit"
          className={cn(
            row,
            rowSize,
            "text-grey-700 hover:bg-danger-50 hover:text-danger-700",
          )}
        >
          <LogoutIcon className="size-5 shrink-0" />
          Вийти
        </button>
      </form>
    </nav>
  );
}
