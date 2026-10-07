import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SearchIcon } from "@/components/ui/icons";

export function CatalogIntro() {
  return (
    <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
      <Container className="flex flex-col gap-6">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Каталог" }]}
        />

        <div className="flex max-w-[680px] flex-col items-start gap-4">
          <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
            Каталог
          </span>

          <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
            Каталог автозапчастин
          </h1>

          <p className="text-pretty text-[16px] leading-[1.6] text-grey-700">
            Шукайте за номером деталі, за категорією або за маркою авто. Якщо
            номера немає — надішліть VIN, і менеджер підбере точно.
          </p>
        </div>

        {/* Той самий пошук, що й на головній — люди звикли до нього */}
        <form
          action="/search"
          role="search"
          className="flex h-14 w-full max-w-[680px] items-center overflow-hidden rounded-[8px] border border-grey-300 bg-white lg:h-16"
        >
          <input
            name="q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            aria-label="Артикул, OEM-номер або VIN"
            placeholder="Артикул, OEM-номер або VIN"
            className="h-full min-w-0 flex-1 bg-transparent px-5 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Знайти"
            className="flex aspect-square h-full shrink-0 items-center justify-center bg-blue-300 text-white transition-colors hover:bg-blue-700"
          >
            <SearchIcon className="size-6" />
          </button>
        </form>
      </Container>
    </section>
  );
}
