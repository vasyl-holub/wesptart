import Image from "next/image";
import Link from "next/link";
import { mainNav } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { CartIcon, ChevronDownIcon, UserIcon } from "@/components/ui/icons";
import { HeaderSearch, MobileSearch } from "@/components/search/header-search";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartBadge } from "@/components/layout/cart-badge";
import { RegionBar } from "@/components/layout/region-bar";

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

export async function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-200 bg-white">
      {/* Смуга всередині закріпленої шапки, а не над нею: при переході
          роутер прокручує до верху першого елемента сторінки й свідомо
          пропускає sticky-блоки, тож усе, що лежить вище, зникало з очей
          (docs/01-app/03-api-reference/02-components/link.md) */}
      <RegionBar />

      <div className="relative">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <Link href="/" aria-label="WestPart — головна" className="shrink-0">
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

            {/* Поле не розтягуємо на всю вільну ширину — на широкому екрані
                воно б тягнулося через пів сторінки. Межа 720px: на 1920
                повітря обабіч лишається, але не зяє, а до 1366 поле і так
                вужче за неї й межа ні на що не впливає */}
            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <HeaderSearch className="w-full max-w-[720px]" />
            </div>

            {/* Контакти переїхали в рядок меню — тут вони відбирали в поля
                пошуку майже 270px, а там праворуч місце стояло порожнім */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 lg:flex">
                {/* relative — щоб лічильник позиціонувався від кнопки */}
                <Link
                  href="/cart"
                  aria-label="Кошик"
                  className={`${action} relative`}
                >
                  <CartIcon className="size-6" />
                  <CartBadge />
                </Link>
                <Link href="/login" aria-label="B2B-кабінет" className={action}>
                  <UserIcon className="size-6" />
                </Link>
              </div>

              {/* На мобільному лишаються лупа й бургер */}
              <MobileSearch />
              <MobileMenu />
            </div>
          </div>
        </Container>
      </div>

      <div className="hidden border-t border-grey-200 lg:block">
        <Container className="py-3">
          <div className="flex items-center justify-between gap-8">
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
          </div>
        </Container>
      </div>
    </header>
  );
}
