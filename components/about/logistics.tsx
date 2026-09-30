import { Container } from "@/components/ui/container";
import {
  ClockIcon,
  MapPinIcon,
  TargetArrowIcon,
  TruckIcon,
} from "@/components/ui/icons";

const logistics = [
  { icon: TruckIcon, text: "Регулярні поставки з Європи" },
  { icon: ClockIcon, text: "Затверджені графіки рейсів" },
  { icon: MapPinIcon, text: "Власна доставка у ключові регіони" },
  { icon: TargetArrowIcon, text: "Прогнозування обсягів" },
];

export function AboutLogistics() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,434px)_minmax(0,580px)] lg:justify-between lg:gap-12">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-50 px-2.5 text-[14px] leading-[1.5] text-blue-50">
              Логістика
            </span>

            <h2 className="text-balance text-[24px] font-semibold leading-[1.4] text-white lg:text-[32px]">
              Логістика як основа стабільності
            </h2>

            <p className="text-pretty text-[16px] leading-[1.6] text-blue-50">
              Наша сила — у контрольованій логістиці. Ми будуємо не пікові
              продажі, а стабільну систему постачання для партнерів.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5">
            {logistics.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex flex-col gap-3 rounded-[12px] bg-blue-600 p-5"
              >
                <Icon className="size-8 text-white" />
                <p className="text-[16px] font-semibold leading-[1.5] text-white">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
