import { Container } from "@/components/ui/container";

const supply = [
  {
    title: "Кузовні деталі",
    text: "Бампери, крила, капоти, панелі та елементи кріплення.",
  },
  {
    title: "Оптика",
    text: "Фари, ліхтарі, покажчики повороту та корпуси дзеркал.",
  },
  {
    title: "Охолодження",
    text: "Радіатори, дифузори, інтеркулери, вентилятори.",
  },
  {
    title: "Технічні компоненти",
    text: "Ходова, електрика та супутні запчастини.",
  },
];

export function AboutSupply() {
  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Що постачаємо з Польщі та ЄС
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Великі європейські склади й регулярні рейси дають широкий асортимент
            і стабільну наявність — без ручного пошуку постачальника під кожне
            замовлення.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supply.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-2 rounded-[16px] border border-grey-200 bg-white p-6"
            >
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                {item.title}
              </h3>
              <p className="text-[14px] leading-[1.55] text-grey-700">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
