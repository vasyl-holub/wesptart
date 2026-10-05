import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AccountNav } from "@/components/account/nav";
import { getCurrentUser } from "@/lib/api/auth";

/**
 * Охорона стоїть у layout, тому кожен вкладений розділ кабінету
 * захищений автоматично — на сторінках лишається тільки їхня робота.
 */
export default async function AccountLayout({
  children,
}: LayoutProps<"/account">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = user.firstName || user.fullName || user.email || "";

  return (
    <Container className="py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Головна", href: "/" }, { label: "Кабінет" }]}
      />

      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-[26px] font-semibold leading-[1.3] text-black-900 sm:text-[32px]">
          Кабінет
        </h1>
        {name && (
          <p className="text-[16px] leading-[1.5] text-grey-700">
            Вітаємо, {name}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
