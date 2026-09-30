import Link from "next/link";
import { StatusBadge } from "@/components/account/status-badge";
import {
  orderTone,
  type OrderListItem,
  type StatusMap,
} from "@/lib/api/orders";
import { formatMoney } from "@/lib/cn";
import { formatDate } from "@/lib/format-date";
import { pluralize } from "@/lib/plural";

export function OrderCard({
  order,
  statuses,
}: {
  order: OrderListItem;
  statuses: StatusMap;
}) {
  const label = statuses[String(order.status)] ?? "невідомий статус";

  return (
    <article className="flex flex-col gap-4 rounded-[16px] border border-grey-200 p-5 transition-colors hover:border-blue-300 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
          <Link
            href={`/account/orders/${order.id}`}
            className="transition-colors hover:text-blue-300"
          >
            Замовлення №{order.number ?? order.id}
          </Link>
        </h3>
        <StatusBadge label={label} tone={orderTone(order.status)} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] leading-[1.45] text-grey-600">Дата</dt>
          <dd className="text-[15px] leading-[1.5] text-black-900">
            {formatDate(order.created)}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] leading-[1.45] text-grey-600">Позицій</dt>
          <dd className="tnum text-[15px] leading-[1.5] text-black-900">
            {pluralize(order.itemsCount, "позиція", "позиції", "позицій")}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] leading-[1.45] text-grey-600">Сума</dt>
          <dd className="tnum text-[15px] font-semibold leading-[1.5] text-black-900">
            {order.total === null ? "—" : formatMoney(order.total)}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] leading-[1.45] text-grey-600">Оплата</dt>
          <dd className="text-[15px] leading-[1.5]">
            {order.isPaid ? (
              <span className="text-green-300">оплачено</span>
            ) : (
              <span className="text-grey-700">не оплачено</span>
            )}
          </dd>
        </div>
      </dl>

      {/* ТТН показуємо лише коли вона вже є — порожній рядок тут гірший за
          відсутній, бо виглядає як загублена посилка */}
      {order.deliveryDeclaration && (
        <p className="text-[14px] leading-[1.5] text-grey-700">
          Накладна:{" "}
          <span className="tnum font-medium text-black-900">
            {order.deliveryDeclaration}
          </span>
        </p>
      )}

      <Link
        href={`/account/orders/${order.id}`}
        className="w-fit text-[15px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
      >
        Деталі замовлення →
      </Link>
    </article>
  );
}
