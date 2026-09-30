import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
} from "@/components/ui/icons";
import { pickup, regions } from "@/lib/site";

/* Іконки тут малюються в 40px, а сітка в них 24 — щоб обведення лишилось
   рівно 2px, як у макеті, зменшуємо його пропорційно: 2 × 24/40 */
const stroke40 = (24 / 40) * 2;

function Item({
  icon: Icon,
  title,
  note,
  strokeWidth,
}: {
  icon: typeof BoxIcon;
  title: string;
  note: string;
  strokeWidth?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        className="size-10 shrink-0 text-blue-300"
        strokeWidth={strokeWidth}
      />
      <div className="flex flex-col">
        <p className="text-[16px] font-semibold leading-[1.5] text-black-900">
          {title}
        </p>
        <p className="text-[14px] leading-[1.5] text-grey-700">{note}</p>
      </div>
    </div>
  );
}

/** Смуга під шапкою: область, пункт видачі, графік */
export function RegionBar() {
  return (
    /* На мобільному смуга не показується взагалі */
    <div className="hidden border-b border-grey-200 bg-white lg:block">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon
              className="size-10 shrink-0 text-blue-300"
              strokeWidth={stroke40}
            />
            <p className="whitespace-nowrap text-[16px] font-semibold leading-[1.5] text-black-900">
              Ваша область:
            </p>
          </div>

          <div className="relative w-[200px]">
            <select
              aria-label="Ваша область"
              defaultValue={regions[0]}
              className="h-10 w-full appearance-none rounded-[8px] border border-grey-300 bg-white pl-3 pr-9 text-[16px] leading-[1.5] text-black-900 focus:border-blue-300 focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-3 top-1/2 size-6 -translate-y-1/2 text-black-900"
              strokeWidth={(20 / 24) * 2}
            />
          </div>
        </div>

        <Item icon={BoxIcon} title="Пункт видачі" note={pickup.address} />

        <Item
          icon={ClockIcon}
          title="Графік"
          note={pickup.hours}
          strokeWidth={stroke40}
        />
      </Container>
    </div>
  );
}
