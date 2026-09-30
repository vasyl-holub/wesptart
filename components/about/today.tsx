import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  DeviceImacIcon,
  Hierarchy3Icon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { site } from "@/lib/site";

const today = [
  { icon: TruckIcon, text: "Стабільні поставки" },
  { icon: DeviceImacIcon, text: "Цифрові рішення" },
  { icon: ShieldCheckIcon, text: "Контроль ризиків" },
  { icon: Hierarchy3Icon, text: "Довгострокове партнерство" },
];

export function AboutToday() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <div className="flex max-w-[640px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-white lg:text-[32px]">
              WestPart сьогодні
            </h2>
            <p className="text-[16px] leading-[1.6] text-blue-50">
              Ми розвиваємо платформу, що поєднує чотири складові.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {today.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-[12px] bg-blue-600 p-5"
              >
                <Icon className="size-8 shrink-0 text-white" />
                <p className="text-[16px] font-semibold leading-[1.4] text-white">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-white/15 pt-10 text-center">
          <p className="text-balance text-[22px] font-semibold leading-[1.4] text-white lg:text-[28px]">
            WestPart — для тих, хто працює системно
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
            >
              Зареєструватися
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex h-12 items-center justify-center rounded-[8px] border border-white/30 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
