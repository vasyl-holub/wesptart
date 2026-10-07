import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCart, getOrderOptions, totalUnits } from "@/lib/api/cart";
import { getCurrentUser } from "@/lib/api/auth";
import { formatMoney } from "@/lib/cn";
import { pluralize } from "@/lib/plural";

export const metadata: Metadata = {
  title: "Оформлення замовлення",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [cart, options] = await Promise.all([getCart(), getOrderOptions()]);

  /* Порожній кошик оформити не можна — повертаємо назад */
  if (cart.items.length === 0) redirect("/cart");

  return (
    <section className="bg-white pb-8 pt-6 lg:pb-12">
      <Container className="flex flex-col gap-8">
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Кошик", href: "/cart" },
            { label: "Оформлення" },
          ]}
        />

        <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
          Оформлення замовлення
        </h1>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-12">
          <CheckoutForm
            deliveries={options.deliveries}
            payMethods={options.payMethods}
          />

          <aside className="flex h-fit flex-col gap-4 rounded-[20px] border border-grey-200 p-6 lg:sticky lg:top-24">
            <h2 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Ваше замовлення
            </h2>

            <dl className="flex flex-col gap-2 text-[15px] leading-[1.5]">
              <div className="flex justify-between gap-3">
                <dt className="text-grey-700">Позицій</dt>
                <dd className="tnum font-semibold text-black-900">
                  {cart.positions}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-grey-700">Одиниць</dt>
                <dd className="tnum font-semibold text-black-900">
                  {totalUnits(cart.items)}
                </dd>
              </div>
            </dl>

            <div className="flex items-baseline justify-between gap-3 border-t border-grey-200 pt-4">
              <span className="text-[16px] leading-[1.5] text-black-900">
                До сплати
              </span>
              <span className="tnum text-[24px] font-semibold leading-[1.3] text-green-300">
                {formatMoney(cart.total)}
              </span>
            </div>

            <p className="text-[13px] leading-[1.5] text-grey-600">
              Вартість доставки рахується окремо й залежить від перевізника та
              міста. У кошику{" "}
              {pluralize(cart.positions, "позиція", "позиції", "позицій")}.
            </p>

            <Link
              href="/cart"
              className="text-[15px] font-semibold leading-[1.5] text-blue-300 underline-offset-2 hover:underline"
            >
              Повернутись у кошик
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}
