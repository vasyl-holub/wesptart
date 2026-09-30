import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const facts = [
  { value: "до 14:00", label: "замовлення вирушає того ж дня" },
  { value: "2 рази", label: "поставки з Європи щотижня" },
  { value: "3", label: "пункти видачі: Луцьк, Львів, Київ" },
  { value: "З ПДВ", label: "безготівковий розрахунок за рахунком" },
];

export function DeliveryIntro() {
  return (
    <section className="bg-blue-25 py-8 lg:py-12">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Доставка і оплата" },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
              Умови покупки
            </span>

            <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Як купити запчастину: від пошуку до отримання
            </h1>

            <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
              <p>
                WestPart — системний постачальник автозапчастин з Європи. Ми
                працюємо з роздрібними клієнтами, СТО, магазинами та оптовими
                партнерами.
              </p>
              <p>
                Нижче — увесь шлях замовлення: як знайти деталь, як оформити, як
                оплатити, коли вона вирушить і як її отримати.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 self-start sm:gap-4">
            {facts.map((f) => (
              <li
                key={f.label}
                className="flex flex-col gap-1 rounded-[16px] border border-grey-200 bg-white p-5"
              >
                <span className="text-[24px] font-semibold leading-[1.3] text-blue-300 lg:text-[28px]">
                  {f.value}
                </span>
                <span className="text-[13px] leading-[1.45] text-grey-700">
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
