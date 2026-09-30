import { Container } from "@/components/ui/container";
import {
  CartIcon,
  CircleCheckIcon,
  TargetArrowIcon,
  TruckIcon,
} from "@/components/ui/icons";

const steps = [
  {
    icon: TargetArrowIcon,
    title: "Знайдіть деталь",
    text: "Введіть артикул або OEM-номер у пошук чи відкрийте каталог. Ціну й наявність видно без реєстрації.",
  },
  {
    icon: CartIcon,
    title: "Оформіть замовлення",
    text: "Додайте товар у кошик і підтвердьте замовлення онлайн. Для точного підбору перевірте сумісність по VIN або напишіть менеджеру.",
  },
  {
    icon: CircleCheckIcon,
    title: "Оплатіть за рахунком",
    text: "Виставляємо рахунок, ви оплачуєте безготівково з ПДВ. Відвантаження — після зарахування коштів або в межах кредитного ліміту.",
  },
  {
    icon: TruckIcon,
    title: "Отримайте зручним способом",
    text: "Власна доставка за графіком, Нова Пошта, Delivery або самовивіз з пункту видачі.",
  },
];

export function DeliverySteps() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Чотири кроки до замовлення
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Процес однаковий для роздрібного клієнта й для B2B-партнера —
            різниця лише в рівні цін і умовах відвантаження.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                  <Icon className="size-7" />
                </span>
                <span className="tnum text-[20px] font-semibold leading-[1.3] text-grey-300">
                  0{i + 1}
                </span>
              </div>

              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                {title}
              </h3>
              <p className="text-[14px] leading-[1.55] text-grey-700">{text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
