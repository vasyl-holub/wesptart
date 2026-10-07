import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  ClockIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TelegramBadge,
  ViberBadge,
} from "@/components/ui/icons";
import {
  mapEmbedUrl,
  mapLinkUrl,
  offices,
  quickChannels,
  telHref,
  type Contact,
} from "@/lib/contacts";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "contacts" */
  const meta = await cmsMetadata("contacts", {
    title: "Контакти",
    description:
      "Телефони відділів WestPart, адреса складу в Луцьку та пункту видачі в Києві. Підберемо запчастину за VIN або артикулом за 5–10 хвилин.",
  });

  return meta;
}

const channelIcon = {
  phone: PhoneIcon,
  viber: ViberBadge,
  telegram: TelegramBadge,
  "viber-b2b": ViberBadge,
} as const;

/** Вміст контакту без обгортки — використовується і в картці, і в панелі */
function ContactBody({ contact }: { contact: Contact }) {
  return (
    <>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium leading-[1.5] text-blue-300">
          {contact.label}
        </span>
        {contact.person && (
          <span className="text-[17px] font-semibold leading-[1.4] text-black-900">
            {contact.person}
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-1.5">
        {contact.phones.map((phone) => (
          <li key={phone}>
            <a
              href={telHref(phone)}
              className="tnum inline-flex items-center gap-2 text-[16px] font-semibold leading-[1.5] text-black-900 transition-colors hover:text-blue-300"
            >
              <PhoneIcon className="size-4.5 shrink-0 text-blue-300" />
              {phone}
            </a>
          </li>
        ))}

        {contact.email && (
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 break-all text-[14px] leading-[1.5] text-grey-700 transition-colors hover:text-blue-300"
            >
              <MailIcon className="size-4.5 shrink-0 text-blue-300" />
              {contact.email}
            </a>
          </li>
        )}
      </ul>

      <div className="mt-auto flex gap-2 border-t border-grey-200 pt-3">
        <ClockIcon className="mt-0.5 size-4.5 shrink-0 text-grey-300" />
        <ul className="flex flex-col gap-0.5">
          {contact.schedule.map((line) => (
            <li key={line} className="text-[13px] leading-[1.5] text-grey-700">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <li className="flex flex-col gap-3 rounded-[20px] border border-grey-200 bg-white p-5 transition-colors hover:border-blue-300">
      <ContactBody contact={contact} />
    </li>
  );
}

export default function ContactsPage() {
  return (
    <>
      {/* ─────────────────────────────────── Вступ і швидкі канали */}
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container>
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Контакти" }]}
          />

          <div className="mt-6 flex max-w-[640px] flex-col gap-3">
            <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Контакти
            </h1>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Підберемо запчастину за VIN або артикулом за 5–10 хвилин.
              Телефонуйте у потрібний відділ або напишіть у месенджер — так
              швидше за все.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickChannels.map((c) => {
              const Icon = channelIcon[c.id];
              return (
                <li key={c.id}>
                  <a
                    href={c.href}
                    className="group flex h-full flex-col gap-3 rounded-[20px] border border-grey-200 bg-white p-5 transition-[border-color,box-shadow] hover:border-blue-300 hover:shadow-md"
                  >
                    <Icon className="size-10 text-blue-300" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[13px] leading-[1.5] text-grey-600">
                        {c.label}
                      </span>
                      <span className="tnum text-[17px] font-semibold leading-[1.4] text-black-900 transition-colors group-hover:text-blue-300">
                        {c.value}
                      </span>
                      <span className="mt-1 text-[13px] leading-[1.45] text-grey-700">
                        {c.note}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ─────────────────────────────────── Офіси */}
      {offices.map((office, index) => {
        const single = office.contacts.length === 1;

        return (
          <section
            key={office.id}
            className={
              index % 2 === 1 ? "bg-blue-25 py-12 lg:py-16" : "py-12 lg:py-16"
            }
          >
            <Container className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span className="inline-flex h-8 w-fit items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
                  {office.kind === "office" ? "Головний офіс" : "Пункт видачі"}
                </span>

                <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
                  м. {office.city} — {office.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="flex items-center gap-2 text-[16px] leading-[1.5] text-grey-700">
                    <MapPinIcon className="size-5 shrink-0 text-blue-300" />
                    {office.address}
                  </p>
                  {/* Для одного контакту кнопка маршруту вже є в рядку нижче —
                    друге посилання на карту поруч було б дублем */}
                  {!single && (
                    <a
                      href={mapLinkUrl(office.mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[14px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
                    >
                      Відкрити на карті
                      <ExternalLinkIcon className="size-4" />
                    </a>
                  )}
                </div>
              </div>

              {single ? (
                /* Один контакт — дані рядком, карта на всю ширину під ними.
                 Вертикальна панель поруч із картою лишалась напівпорожньою:
                 телефон і графік не заповнюють 380px висоти. */
                <div className="flex flex-col gap-8">
                  {/* Дві колонки за змістом: ліворуч дії — подзвонити
                    й доїхати, праворуч довідка — коли працює */}
                  <div className="grid divide-y divide-grey-200 rounded-[20px] border border-grey-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    <div className="flex flex-col items-start gap-4 p-5 lg:p-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium leading-[1.5] text-blue-300">
                          {office.contacts[0].label}
                        </span>
                        {office.contacts[0].phones.map((phone) => (
                          <a
                            key={phone}
                            href={telHref(phone)}
                            className="tnum inline-flex items-center gap-2 text-[17px] font-semibold leading-[1.4] text-black-900 transition-colors hover:text-blue-300"
                          >
                            <PhoneIcon className="size-4.5 shrink-0 text-blue-300" />
                            {phone}
                          </a>
                        ))}
                      </div>

                      <a
                        href={mapLinkUrl(office.mapQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-blue-300 px-5 text-[15px] font-semibold leading-[1.5] text-white transition-opacity hover:opacity-90"
                      >
                        Прокласти маршрут
                        <ExternalLinkIcon className="size-4.5" />
                      </a>
                    </div>

                    <div className="flex flex-col gap-1.5 p-5 lg:p-6">
                      <span className="text-[13px] font-medium leading-[1.5] text-grey-600">
                        Режим роботи
                      </span>
                      <ul className="flex flex-col gap-0.5">
                        {office.contacts[0].schedule.map((line) => (
                          <li
                            key={line}
                            className="text-[14px] leading-[1.5] text-black-900"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Карту вантажимо ліниво — вона важка і не в першому екрані */}
                  <div className="h-72 overflow-hidden rounded-[20px] border border-grey-200 bg-grey-100 lg:h-[420px]">
                    <iframe
                      src={mapEmbedUrl(office.mapQuery)}
                      title={`Карта: ${office.address}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="size-full border-0"
                    />
                  </div>
                </div>
              ) : (
                /* Контакти на всю ширину, карта під ними — так само, як у
                 пункті видачі. Збоку карта підганяла висоту карток під
                 себе й тиснула їх у вузькі колонки. */
                <div className="flex flex-col gap-8">
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {office.contacts.map((contact, i) => (
                      <ContactCard
                        key={`${contact.label}-${i}`}
                        contact={contact}
                      />
                    ))}
                  </ul>

                  <div className="h-72 overflow-hidden rounded-[20px] border border-grey-200 bg-grey-100 lg:h-[420px]">
                    <iframe
                      src={mapEmbedUrl(office.mapQuery)}
                      title={`Карта: ${office.address}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="size-full border-0"
                    />
                  </div>
                </div>
              )}
            </Container>
          </section>
        );
      })}

      {/* ─────────────────────────────────── Заклик */}
      <section className="bg-blue-700 py-12 lg:py-14">
        <Container>
          <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-[560px] flex-col gap-2">
              <h2 className="text-balance text-[22px] font-semibold leading-[1.4] text-white lg:text-[26px]">
                Не знаєте, у який відділ звертатися?
              </h2>
              <p className="text-pretty text-[15px] leading-[1.6] text-blue-50">
                Напишіть у Viber — надішліть VIN, артикул або фото деталі.
                Менеджер сам переадресує запит потрібному спеціалісту.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="viber://chat?number=%2B380507135500"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
              >
                <ViberBadge className="size-6" />
                Написати у Viber
              </a>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-[8px] border border-white/30 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
              >
                Зареєструватися
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
