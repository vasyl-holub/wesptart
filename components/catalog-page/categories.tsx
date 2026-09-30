import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ChevronRightIcon } from "@/components/ui/icons";
import type { CatalogCategory } from "@/lib/api/catalog";

export function CatalogCategories({ items }: { items: CatalogCategory[] }) {
  if (!items.length) return null;

  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            За категорією
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            {items.length} груп товарів — від кузовних деталей і оптики до
            фільтрів та експлуатаційних рідин.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/catalog/category/${c.slug}`}
                className="group flex items-center justify-between gap-3 rounded-[12px] border border-grey-200 px-5 py-4 transition-colors hover:border-blue-300"
              >
                <span className="text-[15px] leading-[1.5] text-black-900">
                  {c.name}
                </span>
                <ChevronRightIcon className="size-5 shrink-0 text-grey-600 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
