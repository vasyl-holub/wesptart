import type { Metadata } from "next";
import Link from "next/link";
import { OrderCard } from "@/components/account/order-card";
import { buttonClasses } from "@/components/ui/button";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import {
  getOrders,
  getOrderStatuses,
  getPipelineCounts,
} from "@/lib/api/orders";
import { getProfile } from "@/lib/api/account";
import { formatMoney } from "@/lib/cn";
import { pluralize } from "@/lib/plural";

export const metadata: Metadata = {
  title: "Кабінет",
  robots: { index: false, follow: false },
};

const RECENT = 3;

export default async function AccountOverviewPage() {
  const [page, profile, statuses, pipeline] = await Promise.all([
    getOrders(1, RECENT),
    getProfile(),
    getOrderStatuses(),
    getPipelineCounts(),
  ]);

  const debt = profile?.debt ?? 0;
  const needToPay = profile?.needToPay ?? 0;

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
                  До оплати
                </span>
                <span className="tnum text-[20px] font-semibold leading-[1.4] text-danger-700">
                  {formatMoney(debt)}
                </span>
              </div>
            )}
            {/* Друга сума лише коли вона відрізняється: інакше поруч
                стояли б дві майже однакові мітки про одне й те саме */}
            {needToPay > 0 && needToPay !== debt && (
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

          {/* Повідомити про оплату можна лише звідси: у B2B клієнт платить
              загальну суму, а не конкретне замовлення */}
          <div className="flex flex-col items-start gap-1 sm:items-end">
            {profile?.creditDays ? (
              <span className="text-[14px] leading-[1.5] text-danger-700">
                Відстрочка{" "}
                {pluralize(profile.creditDays, "день", "дні", "днів")}
              </span>
            ) : null}
            <Link
              href="/account/payments/notify"
              className="text-[14px] font-semibold leading-[1.5] text-danger-700 underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              Уже оплатили? Повідомте нас →
            </Link>
          </div>
        </div>
      )}

      {/* Поточні робочі стани замість підсумків за весь час: клієнта
          цікавить, що з його замовленнями зараз, а не скільки їх було.
          Картка веде у список, відфільтрований по тих самих статусах. */}
      <ul className="grid gap-4 sm:grid-cols-3">
        {pipeline.map((stage) => (
          <li key={stage.key}>
            <Link
              href={"/account/orders?status=" + stage.statuses.join(",")}
              className="flex h-full flex-col gap-1 rounded-[16px] border border-grey-200 p-5 transition-colors hover:border-blue-300"
            >
              <span className="tnum text-[22px] font-semibold leading-[1.3] text-black-900">
                {stage.count}
              </span>
              <span className="text-[14px] leading-[1.5] text-grey-700">
                {stage.label}
              </span>
            </Link>
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
