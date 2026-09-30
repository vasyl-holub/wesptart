import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const retail = [
  "Роздрібна ціна без реєстрації",
  "Актуальна наявність у картці товару",
  "Пошук за артикулом або OEM-номером",
];

const partner = [
  "Рівні цін відповідно до обсягу співпраці",
  "Завантаження прайс-листів",
  "Персональний супровід менеджера",
];

export function DeliveryPricing() {
  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Ціни та рівні для партнерів
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Роздрібну ціну видно одразу. Партнерські рівні відкриваються після
            реєстрації в B2B-кабінеті.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 bg-white p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Без реєстрації
            </h3>
            <ul className="flex flex-col gap-3">
              {retail.map((r) => (
                <li
                  key={r}
                  className="flex items-center gap-3 text-[16px] leading-[1.5] text-grey-700"
                >
                  <CircleCheckIcon className="size-6 shrink-0 text-grey-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-[20px] border border-green-300/25 bg-white p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Після реєстрації B2B
            </h3>
            <ul className="flex flex-col gap-3">
              {partner.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[15px] leading-[1.5] text-grey-700">
          Рівень цін визначається системно та переглядається залежно від обороту
          — без ручних винятків.
        </p>
      </Container>
    </section>
  );
}
