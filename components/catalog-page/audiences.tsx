import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ChevronRightIcon } from "@/components/ui/icons";

/**
 * Друга й третя аудиторії каталогу: бізнес і майбутні франчайзі.
 *
 * Вони стоять після VIN-банера свідомо — спершу сторінка відпрацьовує
 * роздріб (пошук → каталог → підбір), і лише потім пропонує окрему
 * воронку тим, кому потрібне не одне замовлення.
 */
const audiences = [
  {
    title: "Для бізнесу",
    note: "СТО, магазини, онлайн-продавці та оптові клієнти",
    action: "Умови для бізнесу",
    href: "/cooperation",
  },
  {
    title: "Стати партнером WestPart",
    note: "Розвивайте продаж кузовних запчастин у своєму регіоні",
    action: "Дізнатися про франшизу",
    href: "/franchise",
  },
];

export function CatalogAudiences() {
  return (
    <section className="pb-12 lg:pb-16">
      <Container className="flex flex-col gap-8">
        <h2 className="max-w-[640px] text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
          WestPart — не тільки для власників авто
        </h2>

        <ul className="grid gap-4 sm:grid-cols-2">
          {audiences.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="group flex h-full flex-col gap-3 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
              >
                <span className="text-[18px] font-semibold leading-[1.4] text-black-900">
                  {a.title}
                </span>
                <span className="text-[15px] leading-[1.55] text-grey-700">
                  {a.note}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[15px] font-semibold leading-[1.5] text-blue-300">
                  {a.action}
                  <ChevronRightIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
