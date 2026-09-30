import { Container } from "@/components/ui/container";
import {
  BoltIcon,
  CircleCheckIcon,
  DeviceImacIcon,
  Hierarchy3Icon,
  TargetArrowIcon,
} from "@/components/ui/icons";

/**
 * AI показуємо як напрям розвитку й те, як він уже працює в процесах,
 * а не як окремий продукт — так просив замовник.
 */
const aiDirections = [
  {
    icon: DeviceImacIcon,
    title: "Автоматизація процесів",
    text: "Ключові процеси працюють у напівавтоматичному режимі — від формування замовлення до відвантаження.",
    items: [
      "Обробка замовлень",
      "Контроль залишків",
      "Логістичне планування",
      "Фінансовий облік",
    ],
  },
  {
    icon: TargetArrowIcon,
    title: "Аналітична система",
    text: "Внутрішні дані формують аналітичне ядро, яке зменшує ризики й підвищує точність рішень.",
    items: [
      "Попит і сезонність",
      "Поведінка клієнтів",
      "Ефективність постачальників",
      "Логістичні цикли",
    ],
  },
  {
    icon: BoltIcon,
    title: "Алгоритмічне ціноутворення",
    text: "Модуль тримає рівні цін у межах правил, однакових для всіх партнерів.",
    items: [
      "Контроль маржі",
      "Управління рівнями цін",
      "Аналіз обсягів",
      "Тестування цінових сценаріїв",
    ],
  },
  {
    icon: Hierarchy3Icon,
    title: "Подальший розвиток",
    text: "Розвиваємо систему поетапно, без хаотичних впроваджень.",
    items: [
      "Управління ланцюгом постачання",
      "Прогнозування попиту",
      "Динамічне планування логістики",
      "Інтеграція з аналітичними сервісами",
    ],
  },
];

export function AboutTechnology() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[680px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Технології та AI
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            WestPart будує цифрову систему управління, що поєднує аналітику,
            автоматизацію та алгоритмічну логіку. Мета — зробити замовлення,
            постачання й ціноутворення передбачуваними та керованими.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {aiDirections.map(({ icon: Icon, title, text, items }) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                <Icon className="size-7" />
              </span>
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                {title}
              </h3>
              <p className="text-[14px] leading-[1.55] text-grey-700">{text}</p>

              <ul className="mt-1 flex flex-col gap-2 border-t border-grey-200 pt-4">
                {items.map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[14px] leading-[1.5] text-black-900"
                  >
                    <CircleCheckIcon className="size-5 shrink-0 text-blue-300" />
                    {i}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* Головна теза розділу: AI тут інструмент, а не окремий продукт */}
        <blockquote className="rounded-[20px] border-l-4 border-blue-300 bg-blue-25 px-6 py-5 lg:px-8 lg:py-6">
          <p className="text-balance text-[18px] font-semibold leading-[1.5] text-black-900 lg:text-[22px]">
            Ми не замінюємо людей алгоритмами — підсилюємо рішення системною
            аналітикою.
          </p>
          <p className="mt-1.5 text-[15px] leading-[1.5] text-grey-700">
            Алгоритми працюють під контролем людини, а фінальне рішення завжди
            лишається за правилами компанії.
          </p>
        </blockquote>
      </Container>
    </section>
  );
}
