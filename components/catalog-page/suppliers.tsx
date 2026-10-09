import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ChevronRightIcon } from "@/components/ui/icons";

/**
 * Роздрібний покупець мислить «моя деталь», а не «мій постачальник»,
 * тож картки названі за типом запчастин. Самі бренди лишилися нижче
 * окремим рядком — для тих, хто все-таки шукає конкретний каталог.
 *
 * Логотипи лежать локально й прийшли з різними полотнами, тому висоту
 * кожного задаємо окремо — як у блоці брендів на головній.
 */
const kinds = [
  {
    slug: "polcar",
    name: "Polcar",
    title: "Кузовні деталі, оптика, радіатори",
    width: 510,
    height: 112,
    size: "h-5",
  },
  {
    slug: "signeda",
    name: "Signeda",
    title: "Оптика та кузовні елементи",
    width: 300,
    height: 300,
    size: "h-18",
  },
  {
    slug: "nty",
    name: "NTY",
    title: "Ходова, електрика, охолодження",
    width: 1759,
    height: 700,
    size: "h-6",
  },
  {
    slug: "depo",
    name: "DEPO",
    title: "Світлотехніка",
    width: 799,
    height: 298,
    size: "h-6",
  },
  {
    slug: "srline",
    name: "SRLine",
    title: "Кузовний ремонт, підсилювачі",
    width: 1280,
    height: 915,
    size: "h-15",
  },
];

export function CatalogSuppliers() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            За типом запчастин
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Наявність і ціни оновлюються синхронно зі складами, тож строк
            поставки видно одразу в картці товару.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kinds.map((k) => (
            <li key={k.slug}>
              <Link
                href={`/catalog/${k.slug}`}
                className="group flex h-full flex-col gap-4 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
              >
                <span className="text-[18px] font-semibold leading-[1.4] text-black-900">
                  {k.title}
                </span>

                <span className="mt-auto inline-flex items-center gap-1 text-[15px] font-semibold leading-[1.5] text-blue-300">
                  Перейти в каталог
                  <ChevronRightIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Бренди — другорядний критерій для роздробу, тож простим рядком */}
        <div className="flex flex-col gap-4 border-t border-grey-200 pt-8 sm:flex-row sm:items-center sm:gap-8">
          <h3 className="shrink-0 text-[16px] font-semibold leading-[1.5] text-black-900">
            Наші постачальники
          </h3>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-5">
            {kinds.map((k) => (
              <li key={k.slug}>
                <Link
                  href={`/catalog/${k.slug}`}
                  aria-label={`Каталог ${k.name}`}
                  className="flex h-10 items-center opacity-70 transition-opacity hover:opacity-100"
                >
                  <Image
                    src={`/brands/${k.slug}.png`}
                    alt={k.name}
                    width={k.width}
                    height={k.height}
                    className={`w-auto max-w-full object-contain ${k.size}`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
