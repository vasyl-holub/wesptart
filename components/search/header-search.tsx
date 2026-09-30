"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрити пошук" : "Пошук"}
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-300 text-white transition-colors hover:bg-blue-700",
          open && "bg-blue-700",
        )}
      >
        {open ? (
          <X className="size-6" strokeWidth={2} />
        ) : (
          <SearchIcon className="size-6" />
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-grey-200 bg-white shadow-lg">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8">
            <form
              action="/search"
              role="search"
              className="flex items-stretch gap-2"
            >
              <input
                ref={inputRef}
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="VIN-код, номер деталі або марка авто"
                className="h-12 min-w-0 flex-1 rounded-[8px] border border-grey-300 px-4 text-[16px] text-black-900 placeholder:text-grey-600 focus:border-blue-300 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <SearchIcon className="size-6" />
                <span className="hidden sm:inline">Знайти</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
