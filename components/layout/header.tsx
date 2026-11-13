import Image from "next/image";
import Link from "next/link";
import { mainNav } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { CartIcon, HeartIcon } from "@/components/ui/icons";
import { HeaderSearch, MobileSearch } from "@/components/search/header-search";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartBadge } from "@/components/layout/cart-badge";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { UserButton } from "@/components/layout/user-button";

/** Кругла кнопка-дія: біла з рамкою, як у макеті */
const action =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-grey-200 bg-white text-black-900 transition-colors hover:border-blue-300 hover:text-blue-300";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-200 bg-white">
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
            {/* З планшета поле стоїть у рядку: на 768–1023 місця для нього
                вистачає, а ховати головну дію сайту за лупою там немає
                причин. Рядок меню лишається під бургером до lg — шість
                пунктів із випадайкою у 768 не вміщаються. */}
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <HeaderSearch className="w-full max-w-[720px]" />
            </div>

            {/* Контакти переїхали в рядок меню — тут вони відбирали в поля
                пошуку майже 270px, а там праворуч місце стояло порожнім */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                {/* Обране живе в кабінеті, тому гостя звідси перекине на
                    вхід — так само, як з кнопки кабінету поруч */}
                <Link
                  href="/account/favorites"
                  aria-label="Обране"
                  className={action}
                >
                  <HeartIcon className="size-6" />
                </Link>

                {/* relative — щоб лічильник позиціонувався від кнопки */}
                <Link
                  href="/cart"
                  aria-label="Кошик"
                  className={`${action} relative`}
                >
                  <CartIcon className="size-6" />
                  <CartBadge />
                </Link>
                <UserButton className={action} />
              </div>

              {/* На телефоні лишаються лупа й бургер; із планшета лупа
                  зайва — поле вже стоїть у рядку */}
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
