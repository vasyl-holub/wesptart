import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const facts = [
  { value: "2008", label: "рік заснування компанії" },
  { value: "Polcar", label: "офіційний партнер в Україні" },
  { value: "5", label: "міст власної доставки" },
  { value: "З ПДВ", label: "офіційна робота, без «сірих» схем" },
];

export function AboutIntro() {
  return (
    <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
      <Container>
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Про нас" }]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
              Про компанію
            </span>

            <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Логістично-сервісна B2B-платформа для професійного ринку
              автозапчастин
            </h1>

            <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
              <p>
                Ми працюємо з 2008 року та забезпечуємо СТО, магазини й гуртових
                партнерів стабільними поставками автозапчастин з Європи.
              </p>
              <p>
                Компанія є офіційним партнером Polcar в Україні та співпрацює з
                провідними європейськими виробниками, формуючи комплексну
                пропозицію для професійного сегмента.
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
