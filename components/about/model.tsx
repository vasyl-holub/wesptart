import { Container } from "@/components/ui/container";
import {
  BoltIcon,
  BoxIcon,
  DeviceImacIcon,
  MapPinIcon,
  TruckIcon,
} from "@/components/ui/icons";

const model = [
  {
    icon: TruckIcon,
    title: "Прямі поставки з Європи",
    text: "Без ланцюжка посередників — коротший шлях деталі й передбачувана ціна.",
  },
  {
    icon: MapPinIcon,
    title: "Власна логістика",
    text: "Свій транспорт і затверджені графіки рейсів у ключові регіони.",
  },
  {
    icon: BoxIcon,
    title: "Контроль залишків",
    text: "Наявність оновлюється синхронно зі складами постачальників.",
  },
  {
    icon: DeviceImacIcon,
    title: "Цифрова аналітика",
    text: "Рішення приймаються за даними продажів, а не на відчуття.",
  },
  {
    icon: BoltIcon,
    title: "Алгоритмічні ціни",
    text: "Рівні цін керуються правилами, однаковими для всіх партнерів.",
  },
];

export function AboutModel() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Наша модель
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            WestPart побудований як системна платформа. П&apos;ять складових,
            які працюють разом і дають партнерам передбачуваний результат.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.map(({ icon: Icon, title, text }) => (
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
            </li>
          ))}
        </ul>

        {/* Ключова теза розділу — виносимо з тексту в акцентний блок */}
        <blockquote className="rounded-[20px] border-l-4 border-blue-300 bg-blue-25 px-6 py-5 lg:px-8 lg:py-6">
          <p className="text-balance text-[18px] font-semibold leading-[1.5] text-black-900 lg:text-[22px]">
            Ми працюємо за правилами, а не через ручні винятки.
          </p>
          <p className="mt-1.5 text-[15px] leading-[1.5] text-grey-700">
            Наша модель орієнтована на довгу дистанцію та передбачуваність.
          </p>
        </blockquote>
      </Container>
    </section>
  );
}
