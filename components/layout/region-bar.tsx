import { Container } from "@/components/ui/container";
import { BoxIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { ContactMenu } from "@/components/layout/contact-menu";
import { RegionSelect } from "@/components/layout/region-select";
import { getRegions } from "@/lib/api/regions";
import { defaultRegion, pickup } from "@/lib/site";

function Item({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof BoxIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Icon className="size-5 shrink-0 text-blue-300" />
      <p className="whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
        {label}: <span className="font-semibold text-black-900">{value}</span>
      </p>
    </div>
  );
}

/**
 * Службова смуга над шапкою: область, пункт видачі, графік і зв'язок.
 *
 * Інформація тут довідкова, тому й поводиться як довідкова — дрібний
 * текст, іконки 20px, смуга прокручується разом зі сторінкою.
 */
export async function RegionBar() {
  const regions = await getRegions();

  return (
    /* На мобільному смуга не показується взагалі */
    <div className="hidden border-b border-grey-200 bg-grey-100 lg:block">
      <Container className="flex items-center justify-between gap-x-8 py-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-5 shrink-0 text-blue-300" />
          <p className="whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
            Ваша область:
          </p>
          <RegionSelect regions={regions} defaultRegion={defaultRegion} />
        </div>

        <div className="flex items-center gap-8">
          <Item icon={BoxIcon} label="Пункт видачі" value={pickup.address} />
          {/* Графік поступається місцем, коли його бракує: він є у футері
              й на сторінці контактів, а номер телефону — ні */}
          <Item
            icon={ClockIcon}
            label="Графік"
            value={pickup.hours}
            className="hidden xl:flex"
          />
          <ContactMenu />
        </div>
      </Container>
    </div>
  );
}
