"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  BoxIcon,
  CarIcon,
  CartIcon,
  HeartIcon,
  HomeIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/icons";

const items = [
  { href: "/account", label: "Огляд", icon: HomeIcon },
  { href: "/account/orders", label: "Замовлення", icon: BoxIcon },
  { href: "/account/payments", label: "Оплати", icon: CartIcon },
  { href: "/account/returns", label: "Повернення", icon: TruckIcon },
  { href: "/account/garage", label: "Гараж", icon: CarIcon },
  { href: "/account/favorites", label: "Обране", icon: HeartIcon },
  { href: "/account/profile", label: "Профіль", icon: UserIcon },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    /* На мобільному це горизонтальна стрічка з прокруткою, на десктопі —
       звичайна бокова колонка */
    <nav aria-label="Розділи кабінету">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {items.map(({ href, label, icon: Icon }) => {
          /* «Огляд» підсвічуємо лише на точному збігу, решту — і на
             вкладених адресах, як-от /account/orders/123 */
          const active =
            href === "/account"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-2.5 whitespace-nowrap rounded-[8px] px-4 text-[15px] leading-[1.5] transition-colors lg:h-12 lg:px-5 lg:text-[16px]",
                  active
                    ? "bg-blue-300 font-semibold text-white"
                    : "text-grey-700 hover:bg-blue-25 hover:text-blue-300",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
