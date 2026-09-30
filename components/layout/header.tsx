import Image from "next/image";
import Link from "next/link";
import { mainNav } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { CartIcon, ChevronDownIcon, UserIcon } from "@/components/ui/icons";
import { Contacts } from "@/components/layout/contacts";
import { HeaderSearch } from "@/components/search/header-search";
import { MobileMenu } from "@/components/layout/mobile-menu";

/** Кругла кнопка-дія: біла з рамкою, як у макеті */
const action =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-grey-200 bg-white text-black-900 transition-colors hover:border-blue-300 hover:text-blue-300";

function NavDropdown({
  label,
  href,
  items,
}: {
  label: string;
  href?: string;
  items: NonNullable<(typeof mainNav)[number]["items"]>;
}) {
  return (
    <div className="group relative">
      <Link
        href={href ?? "#"}
        className="inline-flex items-center gap-1 text-[16px] font-medium leading-[1.5] text-black-900 transition-colors group-hover:text-blue-300 group-focus-within:text-blue-300"
      >
        {label}
        <ChevronDownIcon className="size-5 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
      </Link>

      <div
        className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-3 opacity-0 transition-[opacity,transform] duration-150
          group-hover:visible group-hover:translate-y-0 group-hover:opacity-100
          group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        <div className="rounded-[12px] border border-grey-200 bg-white p-1.5 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-[8px] px-3 py-2 transition-colors hover:bg-blue-25"
            >
              <span className="block text-[15px] font-semibold text-black-900">
                {item.label}
              </span>
              {item.note && (
                <span className="mt-0.5 block text-[13px] leading-snug text-grey-600">
                  {item.note}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-200 bg-white">
      <div className="relative">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 lg:gap-12">
              <Link
                href="/"
                aria-label="WestPart — головна"
                className="shrink-0"
              >
                <Image
                  src="/logo.svg"
                  alt="WestPart"
                  width={161}
                  height={54}
                  priority
                  unoptimized
                  className="h-[54px] w-auto"
                />
              </Link>

              <Contacts className="hidden items-center gap-5 lg:flex" />
            </div>

            {/* На мобільному в макеті лишається тільки бургер */}
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 lg:flex">
                <HeaderSearch />

                <Link href="/cart" aria-label="Кошик" className={action}>
                  <CartIcon className="size-6" />
                </Link>
                <Link href="/login" aria-label="B2B-кабінет" className={action}>
                  <UserIcon className="size-6" />
                </Link>
              </div>

              <MobileMenu />
            </div>
          </div>
        </Container>
      </div>

      <div className="hidden border-t border-grey-200 lg:block">
        <Container className="py-3">
          <nav
            className="flex items-center gap-12"
            aria-label="Головна навігація"
          >
            {mainNav.map((group) =>
              group.items ? (
                <NavDropdown
                  key={group.label}
                  label={group.label}
                  href={group.href}
                  items={group.items}
                />
              ) : (
                <Link
                  key={group.label}
                  href={group.href!}
                  className="text-[16px] font-medium leading-[1.5] text-black-900 transition-colors hover:text-blue-300"
                >
                  {group.label}
                </Link>
              ),
            )}
          </nav>
        </Container>
      </div>
    </header>
  );
}
