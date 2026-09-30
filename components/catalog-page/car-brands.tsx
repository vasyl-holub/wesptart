import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { CarBrand } from "@/lib/api/catalog";

export function CatalogCarBrands({ items }: { items: CarBrand[] }) {
  if (!items.length) return null;

  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            За маркою авто
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            {items.length} марок у базі. Оберіть марку, далі — модель і рік
            випуску.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((b) => (
            <li key={b.id}>
              <Link
                href={`/catalog/car/${b.slug}`}
                className="flex h-full flex-col items-center gap-2 rounded-[12px] border border-grey-200 bg-white p-4 text-center transition-colors hover:border-blue-300"
              >
                <span className="flex h-12 items-center justify-center">
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 object-contain"
                    />
                  ) : null}
                </span>
                <span className="text-[14px] font-semibold leading-[1.4] text-black-900">
                  {b.name}
                </span>
                <span className="tnum text-[12px] leading-[1.4] text-grey-600">
                  {b.carsCount} моделей
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
