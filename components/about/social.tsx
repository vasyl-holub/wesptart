import Image from "next/image";
import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const socialWork = [
  "Безперебійне постачання автозапчастин",
  "Розвиток автоматизації та цифрової екосистеми",
  "Створення робочих місць",
  "Стабільність для партнерів і клієнтів",
];
const vision = [
  { title: "Система", text: "замість короткострокового мислення" },
  { title: "Передбачуваність", text: "замість хаосу" },
  { title: "Правила", text: "замість ситуативних рішень" },
];

export function AboutSocial() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative order-2 aspect-4/3 overflow-hidden rounded-[24px] lg:order-1">
            <Image
              src="/mock/hero/b2b.jpg"
              alt="Ремонтна зона СТО з автомобілями на підйомниках"
              fill
              sizes="(min-width: 1024px) 592px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="order-1 flex flex-col items-start gap-4 lg:order-2">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
              Соціальна позиція
            </span>

            <h2 className="text-balance text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
              Чесний бізнес для України
            </h2>

            <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
              <p>
                WestPart належить до критично важливих підприємств міста Луцька.
                Ми забезпечуємо запчастинами сервіси, перевізників і
                підприємства — наша роль логістична та системна.
              </p>
              <p>
                Працюємо виключно в правовому полі: без «сірих» схем, зі сплатою
                податків в Україні. Наша мета — бути стабільним
                логістично-сервісним хабом для професійного сегмента Західної та
                Центральної України.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {socialWork.map((w) => (
                <li
                  key={w}
                  className="flex items-center gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {vision.map((v) => (
            <li
              key={v.title}
              className="rounded-[16px] border border-grey-200 p-6"
            >
              <p className="text-[18px] font-semibold leading-[1.4] text-blue-300">
                {v.title}
              </p>
              <p className="mt-1 text-[15px] leading-[1.5] text-grey-700">
                {v.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
