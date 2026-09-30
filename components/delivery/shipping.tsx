import { Container } from "@/components/ui/container";
import { BoxIcon, MapPinIcon, TruckIcon } from "@/components/ui/icons";
import { pickup } from "@/lib/site";

/** Власна доставка йде за затвердженим логістичним графіком */
const schedule = [
  { city: "Київ", freq: "2 рази на тиждень" },
  { city: "Львів", freq: "2 рази на тиждень" },
  { city: "Івано-Франківськ", freq: "2 рази на місяць" },
  { city: "Тернопіль", freq: "2 рази на місяць" },
];

const carriers = [
  {
    icon: TruckIcon,
    title: "Нова Пошта",
    text: "Доставка в будь-який населений пункт України згідно тарифів перевізника.",
  },
  {
    icon: BoxIcon,
    title: "Delivery",
    text: "Використовуємо для габаритних та об'ємних вантажів.",
  },
  {
    icon: MapPinIcon,
    title: "Самовивіз",
    text: "З пунктів видачі в Луцьку, Львові та Києві.",
  },
];

export function DeliveryShipping() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Доставка і отримання
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Доставляємо за затвердженим логістичним графіком. Власним
            транспортом — у ключові міста, решту України закриваємо
            перевізниками.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-8">
          <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Власна доставка WestPart
            </h3>

            <ul className="flex flex-col">
              {schedule.map((s) => (
                <li
                  key={s.city}
                  className="flex items-center gap-3 border-b border-grey-200 py-3 first:pt-0 last:border-0 last:pb-0"
                >
                  <span className="text-[16px] leading-[1.5] text-black-900">
                    {s.city}
                  </span>
                  <span
                    aria-hidden
                    className="mt-2.5 h-px min-w-4 flex-1 self-start bg-grey-200"
                  />
                  <span className="shrink-0 text-right text-[14px] font-semibold leading-[1.5] text-blue-300">
                    {s.freq}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-[14px] leading-[1.55] text-grey-700">
              Для Івано-Франківська та Тернополя можливе додаткове відвантаження
              за достатнього обсягу замовлень у регіоні.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <ul className="grid gap-4 sm:grid-cols-3">
              {carriers.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-6"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                    <Icon className="size-7" />
                  </span>
                  <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-[1.55] text-grey-700">
                    {text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 rounded-[16px] bg-blue-25 p-6">
              <h3 className="text-[16px] font-semibold leading-[1.4] text-black-900">
                Пакування та відповідальність
              </h3>
              <p className="text-[14px] leading-[1.55] text-grey-700">
                Додаткове пакування перевізники виконують за власними правилами
                й тарифами. При доставці сторонніми перевізниками
                відповідальність за пошкодження чи затримки регулюється їхніми
                правилами — радимо оформлювати страхування вантажу.
              </p>
              <p className="text-[14px] leading-[1.55] text-grey-700">
                Пункт видачі: {pickup.address}. Графік: {pickup.hours}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
