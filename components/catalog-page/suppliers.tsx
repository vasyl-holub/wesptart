import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ChevronRightIcon } from "@/components/ui/icons";

/**
 * Логотипи постачальників лежать локально й прийшли з різними полотнами,
 * тому висоту кожного задаємо окремо — як у блоці брендів на головній.
 */
const suppliers = [
  {
    slug: "polcar",
    name: "Polcar",
    note: "Кузовні деталі, оптика, радіатори",
    width: 510,
    height: 112,
    size: "h-5",
  },
  {
    slug: "signeda",
    name: "Signeda",
    note: "Оптика та кузовні елементи",
    width: 300,
    height: 300,
    size: "h-18",
  },
  {
    slug: "nty",
    name: "NTY",
    note: "Ходова, електрика, охолодження",
    width: 1759,
    height: 700,
    size: "h-6",
  },
  {
    slug: "depo",
    name: "DEPO",
    note: "Світлотехніка",
    width: 799,
    height: 298,
    size: "h-6",
  },
  {
    slug: "srline",
    name: "SRLine",
    note: "Кузовний ремонт, підсилювачі",
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
            За постачальником
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Основні бренди, з якими працюємо напряму. Наявність і ціни
            оновлюються синхронно зі складами.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/catalog/${s.slug}`}
                className="group flex h-full flex-col gap-4 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
              >
                <span className="flex h-12 items-center">
                  <Image
                    src={`/brands/${s.slug}.png`}
                    alt={s.name}
                    width={s.width}
                    height={s.height}
                    className={`w-auto max-w-full object-contain ${s.size}`}
                  />
                </span>

                <span className="text-[15px] leading-[1.55] text-grey-700">
                  {s.note}
                </span>

                <span className="mt-auto inline-flex items-center gap-1 text-[15px] font-semibold leading-[1.5] text-blue-300">
                  Перейти в каталог
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
