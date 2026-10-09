import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/ui/icons";

/** Чотири кроки шляху деталі — від складу в Європі до клієнта */
const steps = [
  { icon: BoxIcon, label: "Запчастини з Європи" },
  { icon: ShieldCheckIcon, label: "Офіційні документи" },
  { icon: ClockIcon, label: "Контроль терміну" },
  { icon: TruckIcon, label: "Доставка по Україні" },
];

export function CatalogAssurances() {
  return (
    <section className="bg-blue-25 py-10 lg:py-12">
      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <Icon className="size-10 shrink-0 text-blue-300" />
              <span className="text-[16px] font-semibold leading-[1.4] text-black-900">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
