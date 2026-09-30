import { X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const terms = [
  "Безготівковий розрахунок з ПДВ",
  "Оплата згідно виставленого рахунку",
  "Відвантаження після зарахування коштів",
  "Або в межах погодженого кредитного ліміту",
];

export function DeliveryPayment() {
  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="flex max-w-[520px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
              Оплата
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Працюємо виключно за безготівковою формою. Це дає прозорий
              документообіг і однакові правила для всіх партнерів.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <ul className="flex flex-col">
              {terms.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 border-b border-grey-200 py-4 first:pt-0 last:border-0 last:pb-0"
                >
                  <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                  <span className="text-[16px] leading-[1.5] text-black-900">
                    {t}
                  </span>
                </li>
              ))}
            </ul>

            <p className="flex items-center gap-3 rounded-[16px] bg-grey-100 px-5 py-4 text-[15px] leading-[1.5] text-grey-700">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-grey-600">
                <X className="size-3.5" strokeWidth={2.5} />
              </span>
              Накладений платіж не застосовується
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
