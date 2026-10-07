import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
} from "@/components/ui/icons";
import { pickup, regions } from "@/lib/site";

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BoxIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-5 shrink-0 text-blue-300" />
      <p className="whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
        {label}: <span className="font-semibold text-black-900">{value}</span>
      </p>
    </div>
  );
}

/**
 * Службова смуга над шапкою: область, пункт видачі, графік.
 *
 * Інформація тут довідкова, тому й поводиться як довідкова — дрібний
 * текст, іконки 20px, смуга прокручується разом зі сторінкою. Раніше
 * вона стояла під меню з іконками 40px і важила стільки ж, скільки
 * пошук, хоча читають її набагато рідше.
 */
export function RegionBar() {
  return (
    /* На мобільному смуга не показується взагалі */
    <div className="hidden border-b border-grey-200 bg-grey-100 lg:block">
      <Container className="flex items-center justify-between gap-x-8 gap-y-2 py-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-5 shrink-0 text-blue-300" />
          <p className="whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
            Ваша область:
          </p>

          <div className="relative">
            <select
              aria-label="Ваша область"
              defaultValue={regions[0]}
              className="h-7 appearance-none rounded-[6px] border border-grey-300 bg-white pl-2 pr-7 text-[14px] font-semibold leading-[1.5] text-black-900 focus:border-blue-300 focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 size-4 -translate-y-1/2 text-grey-700" />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Item icon={BoxIcon} label="Пункт видачі" value={pickup.address} />
          <Item icon={ClockIcon} label="Графік" value={pickup.hours} />
        </div>
      </Container>
    </div>
  );
}
