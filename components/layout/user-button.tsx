"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon } from "@/components/ui/icons";
import { currentUserBadgeAction } from "@/app/login/actions";

type Badge = { initials: string; name: string };

/* Хто ввійшов — тримаємо поза React, як і лічильник кошика: значок є і в
   шапці, і в мобільному меню, а провайдер довелося б натягувати на весь
   застосунок заради двох літер. */
let cached: Badge | null = null;
let asked = false;
const listeners = new Set<(value: Badge | null) => void>();

async function load() {
  if (asked) return;
  asked = true;
  try {
    cached = await currentUserBadgeAction();
  } catch {
    /* Не змогли спитати — лишається іконка, як для гостя */
    cached = null;
  }
  for (const fn of listeners) fn(cached);
}

/**
 * Після входу й виходу значок має оновитись без перезавантаження. Самі
 * перепитати тут не можемо: на момент сабміту сесія ще не змінилась.
 * Тому лише скидаємо кеш, а запит піде, коли редірект змінить адресу.
 */
export function resetUserBadge() {
  asked = false;
  cached = null;
  for (const fn of listeners) fn(null);
}

export function UserButton({
  className,
  onNavigate,
}: {
  className: string;
  onNavigate?: () => void;
}) {
  const [badge, setBadge] = useState<Badge | null>(cached);
  const pathname = usePathname();

  useEffect(() => {
    listeners.add(setBadge);
    return () => {
      listeners.delete(setBadge);
    };
  }, []);

  /* Перший запит при монтуванні, а далі — лише коли кеш скинули входом
     чи виходом: зміна адреси тут потрібна як сигнал, що сесія вже інша */
  useEffect(() => {
    void load();
  }, [pathname]);

  /* До відповіді показуємо іконку й ведемо на вхід — так само, як бачить
     гість. Це збігається з тим, що віддав сервер, тому розмітка не
     стрибає при гідратації. */
  const signedIn = Boolean(badge?.initials);

  return (
    <Link
      href={signedIn ? "/account" : "/login"}
      onClick={onNavigate}
      aria-label={signedIn ? `Кабінет: ${badge?.name}` : "B2B-кабінет"}
      title={signedIn ? badge?.name : undefined}
      className={className}
    >
      {signedIn ? (
        <span
          aria-hidden
          className="text-[15px] font-semibold leading-none tracking-wide"
        >
          {badge?.initials}
        </span>
      ) : (
        <UserIcon className="size-6" />
      )}
    </Link>
  );
}
