import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getInformers } from "@/lib/api/informers";
import { MessageBody } from "@/components/account/message-body";
import { emailDocument, looksLikeHtml } from "@/lib/html-text";
import {
  deleteMessageAction,
  markMessagesReadAction,
} from "@/app/account/actions";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Повідомлення",
  robots: { index: false, follow: false },
};

const PER_PAGE = 10;

export default async function MessagesPage({
  searchParams,
}: PageProps<"/account/messages">) {
  const sp = await searchParams;
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;
  const unreadOnly = sp.unread === "1";

  const list = await getInformers(
    page,
    PER_PAGE,
    unreadOnly ? false : undefined,
  );

  const unreadIds = list.items.filter((m) => !m.isRead).map((m) => m.id);
  const query = unreadOnly ? "unread=1" : "";

  const tabs = [
    { href: "/account/messages", label: "Усі", active: !unreadOnly },
    {
      href: "/account/messages?unread=1",
      label: "Непрочитані",
      active: unreadOnly,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900">
          Повідомлення
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Те, що менеджер або система надсилає саме вам: зміни в замовленнях,
          строки, умови співпраці.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold leading-[1.5] transition-colors",
                active
                  ? "bg-blue-300 text-white"
                  : "border border-grey-200 text-grey-700 hover:border-blue-300 hover:text-blue-300",
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Одна кнопка на всю сторінку: по одному їх позначають рідко,
            а «прочитав усе» — звичний жест для списку сповіщень */}
        {unreadIds.length > 0 && (
          <form action={markMessagesReadAction}>
            {unreadIds.map((id) => (
              <input key={id} type="hidden" name="id" value={id} />
            ))}
            <button
              type="submit"
              className={buttonClasses({ variant: "outline", size: "sm" })}
            >
              Позначити прочитаними
            </button>
          </form>
        )}
      </div>

      {list.items.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {list.items.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-[16px] border border-grey-200 bg-white",
                  /* Непрочитане позначаємо смугою збоку, а не заливкою:
                     лист усередині має власні кольори, і кольорове тло
                     під ним робило картку строкатою */
                  !m.isRead && "border-l-[3px] border-l-blue-300",
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5">
                  <h3 className="flex items-center gap-2 text-[17px] font-semibold leading-[1.4] text-black-900">
                    {!m.isRead && (
                      <span
                        aria-label="Непрочитане"
                        className="size-2 shrink-0 rounded-full bg-blue-300"
                      />
                    )}
                    {m.subject || "Без теми"}
                  </h3>
                  <span className="text-[14px] leading-[1.5] text-grey-600">
                    {formatDate(m.created)}
                  </span>
                </div>

                {m.text &&
                  (looksLikeHtml(m.text) ? (
                    /* Лист в ізольованій рамці: його стилі лишаються при
                       ньому й не розповзаються по кабінету. Рамки навколо
                       немає — інакше виходила б коробка в коробці */
                    <div className="mt-4 border-t border-grey-200 px-5 pt-4">
                      <MessageBody
                        html={emailDocument(m.text, m.subject)}
                        title={m.subject || "Повідомлення"}
                      />
                    </div>
                  ) : (
                    <p className="mt-3 whitespace-pre-line px-5 text-[15px] leading-[1.6] text-grey-700">
                      {m.text}
                    </p>
                  ))}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-grey-200 px-5 py-3">
                  {m.senderName && (
                    <span className="text-[14px] leading-[1.5] text-grey-600">
                      {m.senderName}
                    </span>
                  )}

                  <div className="ml-auto flex gap-2">
                    {!m.isRead && (
                      <form action={markMessagesReadAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          className="text-[14px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
                        >
                          Прочитано
                        </button>
                      </form>
                    )}
                    <form action={deleteMessageAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="text-[14px] leading-[1.5] text-grey-600 transition-colors hover:text-danger-700"
                      >
                        Прибрати
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {list.pagesCount > 1 && (
            <Pagination
              current={page}
              total={list.pagesCount}
              hrefFor={(n) => {
                const parts = [query, n > 1 ? `page=${n}` : ""].filter(Boolean);
                return parts.length
                  ? `/account/messages?${parts.join("&")}`
                  : "/account/messages";
              }}
            />
          )}
        </>
      ) : (
        <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
          {unreadOnly
            ? "Непрочитаних повідомлень немає."
            : "Повідомлень поки немає."}
        </p>
      )}
    </div>
  );
}
