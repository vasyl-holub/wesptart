import Image from "next/image";
import Link from "next/link";
import { footerNav, site, socials } from "@/lib/site";
import { Container } from "@/components/ui/container";
import {
  ClockIcon,
  FacebookBadge,
  InstagramBadge,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TelegramBadge,
  TiktokBadge,
  ViberBadge,
  YoutubeBadge,
} from "@/components/ui/icons";

const socialBadges = {
  youtube: YoutubeBadge,
  instagram: InstagramBadge,
  facebook: FacebookBadge,
  tiktok: TiktokBadge,
  viber: ViberBadge,
  telegram: TelegramBadge,
};

const contacts = [
  { icon: PhoneIcon, text: site.phone, href: site.phoneHref, tnum: true },
  { icon: MailIcon, text: site.email, href: `mailto:${site.email}` },
  { icon: MapPinIcon, text: site.city },
  { icon: ClockIcon, text: site.workingHours },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-blue-700">
      <Container className="py-12">
        {/* Моб.: усе по центру одним стовпчиком. Десктоп: 380 / 680 по краях */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="flex flex-col items-center gap-6 lg:w-[380px] lg:shrink-0 lg:items-start lg:gap-8">
            <div className="flex flex-col items-center gap-4 lg:items-start">
              <Link href="/" aria-label="WestPart — головна">
                <Image
                  src="/logo-light.svg"
                  alt="WestPart"
                  width={191}
                  height={64}
                  priority={false}
                  unoptimized
                />
              </Link>

              <p className="max-w-[254px] text-center text-[16px] leading-[1.5] text-white lg:max-w-none lg:text-left">
                {site.lead}
              </p>
            </div>

            {/* Ширина по вмісту, а не 195px з макета: рядки лишаються
                вирівняні по лівому краю, блок центрується, і найдовший
                рядок не переноситься незалежно від довжини тексту */}
            <address className="flex w-fit flex-col gap-2.5 not-italic">
              {contacts.map(({ icon: Icon, text, href, tnum }) => {
                const body = (
                  <>
                    <Icon className="size-6 shrink-0 text-blue-50" />
                    <span className={tnum ? "tnum" : undefined}>{text}</span>
                  </>
                );
                const cls =
                  "flex items-center gap-2 whitespace-nowrap text-[16px] font-medium leading-[1.5] text-white";

                return href ? (
                  <a
                    key={text}
                    href={href}
                    className={`${cls} transition-colors hover:text-blue-50`}
                  >
                    {body}
                  </a>
                ) : (
                  <p key={text} className={cls}>
                    {body}
                  </p>
                );
              })}
            </address>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:w-[680px] lg:shrink-0 lg:gap-12">
            {footerNav.map((col) => (
              <div
                key={col.title}
                className="flex flex-col items-center gap-3.5 lg:items-start"
              >
                <h3 className="text-[24px] font-semibold leading-[1.5] text-white">
                  {col.title}
                </h3>
                <ul className="flex flex-col items-center gap-2.5 lg:items-start">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[16px] leading-[1.5] text-blue-50 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Розділювач з макета — світліший за фон, але темніший за картки */}
      <div className="border-t border-[#203d70]">
        <Container className="flex flex-col items-center gap-12 py-5 lg:flex-row lg:justify-between lg:gap-5">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {socials.map((s) => {
              const Badge = socialBadges[s.icon];
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="block transition-transform hover:-translate-y-0.5"
                  >
                    <Badge className="size-10 text-[#00b0f2]" />
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="text-[14px] leading-[1.5] text-grey-200">
            © {new Date().getFullYear()} {site.name}. Усі права захищені
          </p>
        </Container>
      </div>
    </footer>
  );
}
