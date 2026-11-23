import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/account/status-badge";
import { ClearCart } from "@/components/checkout/clear-cart";
import { getCurrentUser } from "@/lib/api/auth";
import {
  getOrder,
  getOrders,
  getOrderStatuses,
  orderTone,
} from "@/lib/api/orders";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/cn";
import { pluralize } from "@/lib/plural";

export const metadata: Metadata = {
  title: "Замовлення прийнято",
  robots: { index: false, follow: false },
};

/** Адреса без ідентифікатора: бекенд створив замовлення, але id не повернув */
const NO_ID = "-";

/**
 * Екран після оформлення. Окремою адресою, а не блоком у формі: сторінка
 * оформлення повертає в кошик, щойно той порожніє, — а після замовлення
 * він саме порожній.
 *
 * Сторінка ніколи не віддає 404. Замовлення на цей момент уже створене, і
 * якщо його картка не підтягнулась — це наша проблема з читанням, а не
 * привід сказати клієнту «такої сторінки немає». Тому номер їде ще й
 * окремим параметром `n`: навіть коли жоден запит не спрацював, екран
 * підтвердить замовлення за номером.
 */
export default async function CheckoutDonePage({
  params,
  searchParams,
}: PageProps<"/checkout/done/[id]">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { n } = await searchParams;
  const number = Array.isArray(n) ? n[0] : n;

  const [order, statuses] = await Promise.all([
    id === NO_ID ? null : getOrder(id),
    getOrderStatuses(),
  ]);

  /* Запасний шлях: список замовлень фільтрується по номеру і живе на
     іншому резолвері, ніж картка. Дані скупіші, але підтвердження буде */
  const brief =
    !order && number && /^\d+$/.test(number)
      ? ((await getOrders(1, 1, { number: Number(number) })).items[0] ?? null)
      : null;

  const shownNumber = order?.number ?? brief?.number ?? number ?? null;
  const status = order?.status ?? brief?.status ?? null;
  const orderId = order?.id ?? brief?.id ?? (id === NO_ID ? null : id);

  const pickup = /самовив|пункт видач/i.test(order?.deliveryName ?? "");
  const invoice = /безготівк|рахунок|пдв/i.test(order?.payMethodName ?? "");

  /* Наступний крок залежить від того, як клієнт платить і забирає */
  const next = !order
    ? "Менеджер підтвердить наявність і звʼяжеться з вами."
    : invoice
      ? "Менеджер підтвердить наявність і надішле рахунок на оплату."
      : pickup
        ? "Менеджер підтвердить наявність і повідомить, коли замовлення чекатиме у пункті видачі."
        : "Менеджер підтвердить наявність і передасть замовлення в доставку.";

  const rows = [
    {
      label: "Дата",
      value: formatDate(order?.created ?? brief?.created ?? ""),
    },
    {
      label: "Позицій",
      value: order
        ? pluralize(order.items.length, "позиція", "позиції", "позицій")
        : brief
          ? pluralize(brief.itemsCount, "позиція", "позиції", "позицій")
          : "",
    },
    { label: "Доставка", value: order?.deliveryName ?? "" },
    { label: "Спосіб оплати", value: order?.payMethodName ?? "" },
  ].filter((r) => r.value);

  const total = order?.total ?? brief?.total ?? null;

  return (
    <section className="bg-white pb-12 pt-6 lg:pb-16">
      <Container className="flex max-w-[760px] flex-col gap-6">
        {/* Значок у шапці ще тримає стару кількість: layout після
            редіректу не перемонтовується */}
        <ClearCart />

        <div className="flex flex-col items-center gap-3 text-center">
          <CircleCheckIcon className="size-12 text-green-300" />
          <h1 className="text-balance text-[26px] font-semibold leading-[1.3] text-black-900 lg:text-[32px]">
            {shownNumber
              ? `Замовлення №${shownNumber} прийнято`
              : "Замовлення прийнято"}
          </h1>
          <p className="max-w-[520px] text-[16px] leading-[1.6] text-grey-700">
            {next}
          </p>
        </div>

        {(order || brief) && (
          <div className="flex flex-col gap-5 rounded-[20px] border border-grey-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                Склад замовлення
              </h2>
              <StatusBadge
                label={statuses.order[String(status)] ?? "прийнято"}
                tone={orderTone(status)}
              />
            </div>

            {order && (
              <ul className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-grey-200 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="min-w-0 flex-1 text-[15px] leading-[1.5] text-black-900">
                      {item.product ? (
                        <Link
                          href={`/part/${item.product.slug}/${item.product.id}`}
                          className="transition-colors hover:text-blue-300"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        "Товар"
                      )}
                      {item.product?.num && (
                        <span className="tnum block text-[13px] leading-[1.45] text-grey-600">
                          {[item.product.brand, item.product.num]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </span>
                    <span className="tnum shrink-0 text-[14px] leading-[1.5] text-grey-700">
                      {item.count} шт.
                    </span>
                    <span className="tnum w-24 shrink-0 text-right text-[15px] font-semibold leading-[1.5] text-black-900">
                      {item.total === null ? "—" : formatMoney(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <dl
              className={`flex flex-col gap-2 ${order ? "border-t border-grey-200 pt-4" : ""}`}
            >
              {rows.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-[15px] leading-[1.5] text-grey-700">
                    {label}
                  </dt>
                  <dd className="text-[15px] leading-[1.5] text-black-900">
                    {value}
                  </dd>
                </div>
              ))}

              <div className="flex items-baseline justify-between gap-3 border-t border-grey-200 pt-3">
                <dt className="text-[16px] font-semibold leading-[1.5] text-black-900">
                  До сплати
                </dt>
                <dd className="tnum text-[20px] font-semibold leading-[1.4] text-black-900">
                  {total === null ? "—" : formatMoney(total)}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {!order && !brief && (
          <p className="rounded-[20px] border border-grey-200 p-6 text-center text-[15px] leading-[1.6] text-grey-700">
            Склад замовлення зараз не вдалося показати. Саме замовлення прийняте
            — воно вже є у вашому кабінеті.
          </p>
        )}

        {/* На телефоні одна під одною, основна першою */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={orderId ? `/account/orders/${orderId}/` : "/account/orders/"}
            className={buttonClasses({ className: "w-full sm:w-auto" })}
          >
            {orderId ? "Переглянути замовлення" : "Мої замовлення"}
          </Link>
          <Link
            href="/catalog/"
            className={buttonClasses({
              variant: "outline",
              className: "w-full sm:w-auto",
            })}
          >
            Продовжити покупки
          </Link>
        </div>
      </Container>
    </section>
  );
}
