"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Скільки характеристик видно до натискання «Дивитися всі» */
const VISIBLE_SPECS = 9;

function Toggle({
  open,
  onClick,
  children,
}: {
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex items-center gap-1.5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
    >
      {children}
      <ChevronDownIcon
        className={cn(
          "size-5 shrink-0 transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

export function PartInfoCard({
  description,
  specs,
}: {
  description?: string;
  specs: { label: string; value: string }[];
}) {
  const [fullText, setFullText] = useState(false);
  const [allSpecs, setAllSpecs] = useState(false);

  const shown = allSpecs ? specs : specs.slice(0, VISIBLE_SPECS);

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-grey-200 px-6 py-5">
      {description && (
        <>
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-semibold leading-[1.5] text-black-900">
              Опис
            </h2>
            <p
              className={cn(
                "text-[14px] leading-[1.5] text-grey-700",
                !fullText && "line-clamp-3",
              )}
            >
              {description}
            </p>
          </div>

          <Toggle open={fullText} onClick={() => setFullText((v) => !v)}>
            {fullText ? "Згорнути" : "Детальніше"}
          </Toggle>
        </>
      )}

      <div className="flex flex-col gap-2.5">
        <h2 className="text-[20px] font-semibold leading-[1.5] text-black-900">
          Характеристики
        </h2>

        <dl className="flex flex-col gap-2">
          {shown.map((s) => (
            /* items-start, щоб при переносі значення назва й лінія лишались
               на першому рядку, а не з'їжджали в середину */
            <div key={s.label} className="flex items-start gap-2">
              <dt className="shrink-0 whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
                {s.label}
              </dt>
              {/* Лінія-заповнювач; mt-2.5 — половина рядка 14px/1.5 */}
              <span
                aria-hidden
                className="mt-2.5 h-px min-w-4 flex-1 bg-grey-200"
              />
              {/* Значення може перенестись — на вузьких екранах інакше
                  рядок не вміщується */}
              <dd className="min-w-0 text-right text-[14px] font-semibold leading-[1.5] text-black-900">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {specs.length > VISIBLE_SPECS && (
        <Toggle open={allSpecs} onClick={() => setAllSpecs((v) => !v)}>
          {allSpecs ? "Згорнути характеристики" : "Дивитися всі характеристики"}
        </Toggle>
      )}
    </div>
  );
}
