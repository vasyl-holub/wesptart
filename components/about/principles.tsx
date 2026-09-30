import { X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const principlesYes = ["Працюємо офіційно", "Працюємо з ПДВ"];
const principlesNo = [
  "Без «сірих» схем",
  "Без демпінгу",
  "Без хаотичних рішень",
];

export function AboutPrinciples() {
  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Наші принципи
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Ми не конкуруємо короткостроковими знижками. Ми конкуруємо
            стабільністю, сервісом і системністю.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[20px] border border-green-300/25 bg-white p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Як ми працюємо
            </h3>
            <ul className="flex flex-col gap-3">
              {principlesYes.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 bg-white p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Чого не робимо
            </h3>
            <ul className="flex flex-col gap-3">
              {principlesNo.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-3 text-[16px] leading-[1.5] text-grey-700"
                >
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-600">
                    <X className="size-3.5" strokeWidth={2.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
