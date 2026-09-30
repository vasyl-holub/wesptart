import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/account/status-badge";
import { ReturnForm } from "@/components/account/return-form";
import {
  CancelOrderButton,
  OrderCommentForm,
} from "@/components/account/order-actions";
import { buttonClasses } from "@/components/ui/button";
import { ExternalLinkIcon } from "@/components/ui/icons";
import {
  getOrder,
  getOrderStatuses,
  getReturnDictionaries,
  itemTone,
  orderTone,
} from "@/lib/api/orders";
import { productTitle } from "@/lib/api/product";
import { formatMoney } from "@/lib/cn";
import { formatDate } from "@/lib/format-date";

export const metadata: Metadata = {
  title: "Замовлення",
  robots: { index: false, follow: false },
};

export default async function OrderDetailsPage({
  params,
}: PageProps<"/account/orders/[id]">) {
  const { id } = await params;

  const [order, statuses, returnDict] = await Promise.all([
    getOrder(id),
    getOrderStatuses(),
    getReturnDictionaries(),
  ]);

  if (!order) notFound();

  const itemsSum = order.items.reduce((sum, i) => sum + (i.total ?? 0), 0);
  const deliveryCost = Number(order.deliveryCost) || 0;

  const delivery = [
    { label: "Спосіб", value: order.deliveryName },
    { label: "Отримувач", value: order.recipient },
    { label: "Телефон", value: order.phone },
    { label: "Місто", value: order.city },
    { label: "Адреса", value: order.address || order.deliveryInfo },
    { label: "Накладна", value: order.deliveryDeclaration },
    { label: "Відправлено", value: order.shipped && formatDate(order.shipped) },
    {
      label: "Доставка",
      value: order.deliveryDate && formatDate(order.deliveryDate),
    },
    { label: "Оплата", value: order.payMethodName },
  ].filter((r) => r.value);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/account/orders"
        className="w-fit text-[15px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
      >
        &larr; Усі замовлення
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900 sm:text-[26px]">
            Замовлення №{order.number ?? order.id}
          </h2>
          <StatusBadge
            label={statuses.order[String(order.status)] ?? "невідомий статус"}
            tone={orderTone(order.status)}
          />
          {order.isPaid && (
            <span className="text-[15px] leading-[1.5] text-green-300">
              оплачено
            </span>
          )}
        </div>

        <p className="text-[15px] leading-[1.5] text-grey-700">
          Створено {formatDate(order.created)}
        </p>

        {/* Документи генерує бекенд, тому відкриваємо їх у новій вкладці */}
        {(order.printUrl || order.checkUrl) && (
          <div className="flex flex-wrap gap-3">
            {order.printUrl && (
              <a
                href={order.printUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                Рахунок
                <ExternalLinkIcon className="size-4 shrink-0" />
              </a>
            )}
            {order.checkUrl && (
              <a
                href={order.checkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                Чек
                <ExternalLinkIcon className="size-4 shrink-0" />
              </a>
            )}
          </div>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
          Позиції
        </h3>

        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <h4 className="min-w-0 text-[16px] font-semibold leading-[1.5] text-black-900">
                  {item.product ? (
                    <Link
                      href={`/part/${item.product.slug}/${item.product.id}`}
                      className="transition-colors hover:text-blue-300"
                    >
                      {productTitle(item.product)}
                    </Link>
                  ) : (
                    "Позицію видалено з каталогу"
                  )}
                </h4>
                <StatusBadge
                  label={statuses.item[String(item.status)] ?? "—"}
                  tone={itemTone(item.status)}
                />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] leading-[1.45] text-grey-600">
                    Кількість
                  </dt>
                  <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                    {item.count} шт.
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] leading-[1.45] text-grey-600">
                    Ціна
                  </dt>
                  <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                    {item.price === null ? "—" : formatMoney(item.price)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] leading-[1.45] text-grey-600">
                    Сума
                  </dt>
                  <dd className="tnum text-[15px] font-semibold leading-[1.5] text-black-900">
                    {item.total === null ? "—" : formatMoney(item.total)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] leading-[1.45] text-grey-600">
                    Очікується
                  </dt>
                  <dd className="text-[15px] leading-[1.5] text-black-900">
                    {item.arrival ? formatDate(item.arrival) : "—"}
                  </dd>
                </div>
              </dl>

              {item.comment && (
                <p className="text-[14px] leading-[1.5] text-grey-700">
                  {item.comment}
                </p>
              )}

              {item.hasReturn ? (
                <p className="text-[14px] leading-[1.5] text-grey-700">
                  Заявку на повернення вже створено — статус у розділі{" "}
                  <Link
                    href="/account/returns"
                    className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
                  >
                    «Повернення»
                  </Link>
                  .
                </p>
              ) : (
                item.canBeReturned && (
                  <ReturnForm
                    orderItemId={item.id}
                    orderId={order.id}
                    maxCount={item.count}
                    reasons={returnDict.reasons}
                  />
                )
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {delivery.length > 0 && (
          <section className="flex flex-col gap-4">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Доставка
            </h3>
            <dl className="divide-y divide-grey-200 rounded-[16px] border border-grey-200 px-5">
              {delivery.map((r) => (
                <div
                  key={r.label}
                  className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3"
                >
                  <dt className="text-[14px] leading-[1.5] text-grey-600">
                    {r.label}
                  </dt>
                  <dd className="text-right text-[14px] leading-[1.5] text-black-900">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>

            {order.deliveryMessage && (
              <p className="rounded-[12px] bg-blue-25 px-4 py-3 text-[14px] leading-[1.5] text-grey-700">
                {order.deliveryMessage}
              </p>
            )}
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
            Підсумок
          </h3>
          <dl className="flex flex-col gap-3 rounded-[16px] bg-blue-25 p-5">
            <div className="flex justify-between gap-4">
              <dt className="text-[15px] leading-[1.5] text-grey-700">
                Товари
              </dt>
              <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                {formatMoney(itemsSum)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[15px] leading-[1.5] text-grey-700">
                Доставка
              </dt>
              <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                {deliveryCost ? formatMoney(deliveryCost) : "за тарифом"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-grey-200 pt-3">
              <dt className="text-[16px] font-semibold leading-[1.5] text-black-900">
                Разом
              </dt>
              <dd className="tnum text-[18px] font-semibold leading-[1.5] text-black-900">
                {order.total === null ? "—" : formatMoney(order.total)}
              </dd>
            </div>
          </dl>

          {order.canBeReturned && (
            <p className="text-[14px] leading-[1.55] text-grey-700">
              Позиції цього замовлення підлягають поверненню. Умови й строки на
              сторінці{" "}
              <Link
                href="/warranty"
                className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
              >
                гарантії
              </Link>
              .
            </p>
          )}

          {!order.isPaid && (
            <Link
              href="/account/payments"
              className="w-fit text-[14px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
            >
              Уже оплатили? Повідомте нас →
            </Link>
          )}

          {order.canBeCancelled && <CancelOrderButton orderId={order.id} />}
        </section>
      </div>

      <section className="flex flex-col gap-4 border-t border-grey-200 pt-8">
        <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
          Листування з менеджером
        </h3>

        {order.comments.length > 0 && (
          <ul className="flex flex-col gap-3">
            {order.comments.map((c) => (
              <li
                key={c.id}
                className={
                  c.managerName
                    ? "flex flex-col gap-1 rounded-[12px] bg-blue-25 px-4 py-3"
                    : "flex flex-col gap-1 rounded-[12px] border border-grey-200 px-4 py-3"
                }
              >
                <span className="text-[13px] leading-[1.45] text-grey-600">
                  {c.managerName ?? "Ви"} · {formatDate(c.created)}
                </span>
                <span className="text-[15px] leading-[1.5] text-black-900">
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        <OrderCommentForm orderId={order.id} />
      </section>
    </div>
  );
}
