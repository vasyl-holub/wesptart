import Link from "next/link";
import { Container } from "@/components/ui/container";
import { HeadsetIcon } from "@/components/ui/icons";
import { site } from "@/lib/site";

export function DeliveryCta() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container className="flex flex-col items-center gap-6 text-center">
        <HeadsetIcon className="size-10 text-blue-50" />

        <p className="text-balance text-[22px] font-semibold leading-[1.4] text-white lg:text-[28px]">
          Не впевнені, що підходить саме вам?
        </p>
        <p className="max-w-[560px] text-pretty text-[16px] leading-[1.6] text-blue-50">
          Зареєструйтесь, щоб побачити партнерські рівні цін, або напишіть
          менеджеру — підберемо деталь по VIN і підкажемо оптимальний спосіб
          доставки.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
          >
            Зареєструватися
          </Link>
          <a
            href={site.phoneHref}
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-white/30 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
          >
            {site.phone}
          </a>
        </div>

        {/* «Гарантія» більше не в головному меню — лишаємо вхід звідси
            й із футера, бо для B2B це одна з ключових сторінок */}
        <Link
          href="/warranty"
          className="text-[16px] leading-[1.5] text-blue-50 underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Гарантія та повернення
        </Link>
      </Container>
    </section>
  );
}
