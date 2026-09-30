import { Container } from "@/components/ui/container";
import { BoxIcon, ClockIcon, TruckIcon } from "@/components/ui/icons";

const timing = [
  {
    icon: ClockIcon,
    value: "до 14:00",
    text: "Замовлення, оформлені до 14:00, вирушають того ж дня — за наявності товару на складі в Україні.",
  },
  {
    icon: TruckIcon,
    value: "2 рази на тиждень",
    text: "Саме з такою періодичністю йдуть поставки з Європи на наш склад.",
  },
  {
    icon: BoxIcon,
    value: "Після прибуття",
    text: "Товар одразу розподіляється по замовленнях у порядку їх оформлення.",
  },
];

export function DeliveryTiming() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,434px)_minmax(0,580px)] lg:justify-between lg:gap-12">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-50 px-2.5 text-[14px] leading-[1.5] text-blue-50">
              Терміни
            </span>

            <h2 className="text-balance text-[24px] font-semibold leading-[1.4] text-white lg:text-[32px]">
              Коли замовлення вирушає
            </h2>

            <p className="text-pretty text-[16px] leading-[1.6] text-blue-50">
              Терміни залежать від того, де зараз лежить деталь — на складі в
              Україні чи в Європі. У вихідні відправка не здійснюється.
            </p>
          </div>

          <ul className="flex flex-col gap-3 sm:gap-5">
            {timing.map(({ icon: Icon, value, text }) => (
              <li
                key={value}
                className="flex gap-4 rounded-[12px] bg-blue-600 p-5"
              >
                <Icon className="size-8 shrink-0 text-white" />
                <div className="flex flex-col gap-1">
                  <p className="text-[16px] font-semibold leading-[1.5] text-white">
                    {value}
                  </p>
                  <p className="text-[14px] leading-[1.55] text-blue-50">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
