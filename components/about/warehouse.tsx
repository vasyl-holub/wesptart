import Image from "next/image";
import { Container } from "@/components/ui/container";

/**
 * Логотипи прийшли з різними полотнами: у Polcar знак займає весь кадр,
 * а в Signeda та SRLine — лише чверть висоти, решта порожні поля.
 * Тому висоту задаємо кожному окремо, щоб знаки виглядали однаково.
 * Коли будуть обрізані SVG — усі значення зведуться до одного.
 */
const partnerBrands = [
  { slug: "polcar", name: "Polcar", width: 510, height: 112, size: "h-5" },
  { slug: "signeda", name: "Signeda", width: 300, height: 300, size: "h-18" },
  { slug: "nty", name: "NTY", width: 1759, height: 700, size: "h-6" },
  { slug: "depo", name: "DEPO", width: 799, height: 298, size: "h-6" },
  { slug: "srline", name: "SRLine", width: 1280, height: 915, size: "h-15" },
];

export function AboutWarehouse() {
  return (
    <section className="bg-blue-25 pb-12 lg:pb-16">
      <Container className="flex flex-col gap-8">
        <figure className="relative overflow-hidden rounded-[24px]">
          <div className="relative aspect-4/3 sm:aspect-16/9 lg:aspect-21/9">
            <Image
              src="/mock/cta-manager.png"
              alt="Менеджер WestPart на складі автозапчастин"
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
          </div>

          {/* Затемнення знизу, щоб підпис читався на будь-якому кадрі */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black-900/75 to-transparent"
          />

          <figcaption className="absolute inset-x-0 bottom-0 p-5 lg:p-8">
            <p className="text-balance text-[16px] font-semibold leading-[1.4] text-white lg:text-[20px]">
              Власний склад, свої залишки, своя логістика
            </p>
            <p className="mt-1 max-w-[520px] text-pretty text-[13px] leading-[1.5] text-white/75 lg:text-[15px]">
              Наявність, яку ви бачите в кабінеті, — це реальні позиції на
              складі, а не обіцянка постачальника.
            </p>
          </figcaption>
        </figure>

        <div className="flex flex-col gap-4">
          <p className="text-[14px] leading-[1.5] text-grey-700">
            Співпрацюємо з провідними європейськими виробниками
          </p>

          {/* Білі картки, бо частина логотипів іде з білим фоном,
              а не з прозорим — на синьому вони давали б рамки */}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {partnerBrands.map((b) => (
              <li key={b.slug}>
                <div className="flex h-20 items-center justify-center overflow-hidden rounded-[12px] border border-grey-200 bg-white px-4">
                  <Image
                    src={`/brands/${b.slug}.png`}
                    alt={b.name}
                    width={b.width}
                    height={b.height}
                    className={`w-auto max-w-full object-contain ${b.size}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
