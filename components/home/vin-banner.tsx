import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PhoneIcon, ViberBadge } from "@/components/ui/icons";
import { site } from "@/lib/site";

export function VinBanner() {
  return (
    <section className="bg-white py-12">
      <Container>
        {/* Градієнт з макета, точка зламу на 71.6%: на мобільному згори вниз,
            з lg — зліва направо */}
        <div className="flex flex-col gap-8 overflow-hidden rounded-[24px] bg-linear-to-b from-[#042256] via-[#167ed3] via-[71.635%] to-[#0a3d7c] px-5 pt-8 lg:h-70 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:bg-linear-to-r lg:px-0 lg:pl-10 lg:pt-0">
          <div className="flex flex-col gap-6 lg:w-[580px] lg:shrink-0">
            <div className="flex flex-col gap-4">
              <h2 className="text-[24px] font-semibold leading-[1.5] text-white lg:text-[40px] lg:font-bold lg:leading-[54px]">
                Не впевнені, що підходить?
              </h2>
              <p className="text-[20px] leading-[1.5] text-blue-50">
                Перевіримо по VIN і підберемо точно
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:gap-6">
                <a
                  href={site.phoneHref}
                  className="flex w-fit items-center gap-2 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:text-blue-50"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                    <PhoneIcon className="size-5 text-blue-300" />
                  </span>
                  <span className="tnum whitespace-nowrap">{site.phone}</span>
                </a>

                <a
                  href={site.viber}
                  className="flex w-fit items-center gap-2 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:text-blue-50"
                >
                  <ViberBadge className="size-8 shrink-0" />
                  <span className="whitespace-nowrap">Написати у Viber</span>
                </a>
              </div>

              <p className="text-[16px] leading-[1.5] text-blue-50">
                {site.replyTime}
              </p>

              <Link
                href="/requests/create"
                className="inline-flex h-12 w-fit items-center justify-center rounded-[8px] bg-white px-5 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
              >
                Створити запит на підбір
              </Link>
            </div>
          </div>

          {/* -mx-5 гасить бічні відступи картки: фото йде в край і впритул до низу */}
          <div className="relative -mx-5 h-70 lg:mx-0 lg:w-[480px] lg:shrink-0">
            <Image
              src="/mock/cta-manager.png"
              alt="Менеджер WestPart на складі"
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
