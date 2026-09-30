"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { clearCartAction } from "@/app/cart/actions";

export function ClearCartButton() {
  /* Підтвердження на місці, а не браузерний confirm: очищення кошика
     скасувати неможливо, але й окреме модальне вікно тут надлишкове */
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();

  if (asking) {
    return (
      <span className="flex flex-wrap items-center gap-3 text-[14px] leading-[1.5]">
        <span className="text-grey-700">Видалити всі позиції?</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await clearCartAction();
              setAsking(false);
            })
          }
          className="font-semibold text-danger-700 transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Очищаємо…" : "Так, очистити"}
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          disabled={pending}
          className="font-semibold text-grey-700 transition-opacity hover:opacity-80"
        >
          Скасувати
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAsking(true)}
      className="inline-flex items-center gap-2 text-[14px] leading-[1.5] text-grey-700 transition-colors hover:text-danger-700"
    >
      <Trash2 className="size-5" strokeWidth={1.9} />
      Очистити кошик
    </button>
  );
}
