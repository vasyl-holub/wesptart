import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { DeliveryIntro } from "@/components/delivery/intro";
import { DeliverySteps } from "@/components/delivery/steps";
import { DeliveryPricing } from "@/components/delivery/pricing";
import { DeliveryPayment } from "@/components/delivery/payment";
import { DeliveryTiming } from "@/components/delivery/timing";
import { DeliveryShipping } from "@/components/delivery/shipping";
import { DeliveryCta } from "@/components/delivery/cta";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "dostavka-i-oplata" */
  const meta = await cmsMetadata("dostavka-i-oplata", {
    title: "Доставка і оплата — як купити автозапчастини",
    description:
      "Весь процес замовлення в WestPart: пошук деталі, оформлення, безготівкова оплата з ПДВ, терміни відправки та доставка власним транспортом, Новою Поштою або самовивозом.",
  });

  return meta;
}

/**
 * Сторінка об'єднує дві сторінки старого сайту — «Як купити автозапчастини»
 * та «Доставка і оплата» — в один наскрізний процес:
 * знайти → замовити → оплатити → терміни → отримати.
 */
export default function DeliveryPage() {
  return (
    <>
      <DeliveryIntro />
      <DeliverySteps />
      <DeliveryPricing />
      <DeliveryPayment />
      <DeliveryTiming />
      <DeliveryShipping />
      <DeliveryCta />
    </>
  );
}
