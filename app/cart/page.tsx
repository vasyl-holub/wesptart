import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartLine } from "@/components/cart/cart-line";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { ClearCartButton } from "@/components/cart/clear-cart-button";
import { Promo } from "@/components/home/promo";
import { TruckIcon } from "@/components/ui/icons";
import {
  deliveryLabel,
  getCart,
  groupByDelivery,
  totalUnits,
} from "@/lib/api/cart";

export const metadata: Metadata = {
  title: "Кошик",
  description:
    "Ваше замовлення в WestPart — перевірте позиції, кількість і строки поставки перед оформленням.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await getCart();
  const shipments = groupByDelivery(cart.items);
  const units = totalUnits(cart.items);
  const isEmpty = cart.items.length === 0;

  return (
    <>
      <Container className="py-8 lg:py-12">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Кошик" }]}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
            Кошик
            {!isEmpty && (
              <span className="tnum ml-3 text-[20px] font-normal text-grey-600">
                {units} шт.
              </span>
            )}
          </h1>

          {!isEmpty && <ClearCartButton />}
        </div>

        {isEmpty ? (
          <div className="mt-6">
            <EmptyCart />
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-8">
            <div className="flex flex-col gap-4">
              {shipments.length > 1 && (
                <p className="rounded-[12px] border border-blue-300/30 bg-blue-25 px-4 py-3 text-[14px] leading-[1.5] text-black-900">
                  Позиції приїдуть{" "}
                  <b className="font-semibold">
                    {shipments.length === 2 ? "двома" : `${shipments.length}`}{" "}
                    відправками
                  </b>{" "}
                  — щоб ви не чекали на те, що вже є на складі. Доставку другої
                  частини повторно не тарифікуємо.
                </p>
              )}

              {shipments.map((shipment) => (
                <section
                  key={shipment.days}
                  className="overflow-hidden rounded-[24px] border border-grey-200 bg-white"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-200 bg-blue-25 px-5 py-4">
                    <h2 className="flex items-center gap-2.5 text-[16px] font-semibold leading-[1.5] text-black-900">
                      <TruckIcon className="size-6 shrink-0 text-blue-300" />
                      {deliveryLabel(shipment.days)}
                    </h2>
                    <span className="tnum text-[14px] leading-[1.5] text-grey-700">
                      {shipment.items.length} поз.
                    </span>
                  </header>

                  <ul className="divide-y divide-grey-200 px-5">
                    {shipment.items.map((item) => (
                      <CartLine key={item.id} item={item} />
                    ))}
                  </ul>
                </section>
              ))}

              <Link
                href="/catalog"
                className="inline-flex w-fit items-center gap-2 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
              >
                ← Продовжити покупки
              </Link>
            </div>

            <CartSummary
              positions={cart.positions}
              units={units}
              total={cart.total}
            />
          </div>
        )}
      </Container>

      {/* Порожній кошик — глухий кут. Даємо, з чого почати */}
      {isEmpty && <Promo />}
    </>
  );
}
