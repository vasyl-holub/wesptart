import type { Metadata } from "next";
import Link from "next/link";
import { OrderCard } from "@/components/account/order-card";
import { buttonClasses } from "@/components/ui/button";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import { getOrders, getOrderStatuses } from "@/lib/api/orders";
import { getProfile } from "@/lib/api/account";
import { formatMoney } from "@/lib/cn";
import { pluralize } from "@/lib/plural";

export const metadata: Metadata = {
  title: "Кабінет",
  robots: { index: false, follow: false },
};

const RECENT = 3;

export default async function AccountOverviewPage() {
  const [page, profile, statuses] = await Promise.all([
    getOrders(1, RECENT),
    getProfile(),
    getOrderStatuses(),
  ]);

  const debt = profile?.debt ?? 0;
  const needToPay = profile?.needToPay ?? 0;

  const stats = [
    { label: "Усього замовлень", value: String(page.totalCount) },
    { label: "Завершених", value: String(page.completedCount) },
    { label: "На суму", value: formatMoney(page.totalSum) },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Гроші показуємо лише коли вони ненульові: порожні рядки балансу
          у роздрібного клієнта лише відволікають */}
      {(debt > 0 || needToPay > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-danger-500/30 bg-danger-50 px-5 py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {debt > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[1.5] text-danger-700">
                  Заборгованість
                </span>
                <span className="tnum text-[20px] font-semibold leading-[1.4] text-danger-700">
                  {formatMoney(debt)}
                </span>
              </div>
            )}
            {needToPay > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[1.5] text-danger-700">
                  До сплати
                </span>
                <span className="tnum text-[20px] font-semibold leading-[1.4] text-danger-700">
                  {formatMoney(needToPay)}
                </span>
              </div>
            )}
          </div>

          {profile?.creditDays ? (
            <span className="text-[14px] leading-[1.5] text-danger-700">
              Відстрочка {pluralize(profile.creditDays, "день", "дні", "днів")}
            </span>
          ) : null}
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <li
            key={s.label}
            className="flex flex-col gap-1 rounded-[16px] border border-grey-200 p-5"
          >
            <span className="tnum text-[22px] font-semibold leading-[1.3] text-black-900">
              {s.value}
            </span>
            <span className="text-[14px] leading-[1.5] text-grey-700">
              {s.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Персональний менеджер — головна перевага B2B-кабінету перед
          загальним телефоном: людина вже знає вашу історію замовлень */}
      {profile?.manager?.fullName && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-blue-25 p-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] leading-[1.5] text-grey-700">
              Ваш менеджер
            </span>
            <span className="text-[18px] font-semibold leading-[1.4] text-black-900">
              {profile.manager.fullName}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {profile.manager.phone && (
              <a
                href={`tel:${profile.manager.phone.replace(/[^\d+]/g, "")}`}
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                <PhoneIcon className="size-4 shrink-0" />
                {profile.manager.phone}
              </a>
            )}
            {profile.manager.email && (
              <a
                href={`mailto:${profile.manager.email}`}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                <MailIcon className="size-4 shrink-0" />
                Написати
              </a>
            )}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
            Останні замовлення
          </h2>
          {page.items.length > 0 && (
            <Link
              href="/account/orders"
              className="text-[15px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
            >
              Усі замовлення →
            </Link>
          )}
        </div>

        {page.items.length ? (
          <ul className="flex flex-col gap-4">
            {page.items.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} statuses={statuses.order} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[16px] border border-grey-200 p-6">
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Замовлень поки немає. Знайдіть деталь за артикулом або залиште
              заявку — менеджер підбере по VIN.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className={buttonClasses({ variant: "primary" })}
              >
                До каталогу
              </Link>
              <Link
                href="/requests/create"
                className={buttonClasses({ variant: "outline" })}
              >
                Заявка на підбір
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
