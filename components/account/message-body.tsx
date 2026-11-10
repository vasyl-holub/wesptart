"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Тіло повідомлення. Листи приходять цілими HTML-документами з власним
 * `<style>`, тому показуємо їх в iframe: інакше стилі листа розповзлися б
 * по кабінету, а таблиці з фіксованими ширинами зламали б верстку.
 *
 * `sandbox` без `allow-scripts` — скрипти з листа не виконуються;
 * `allow-same-origin` потрібен тільки щоб зміряти висоту вмісту.
 */
export function MessageBody({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;

    const measure = () => {
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      /* +2px: без запасу остання стрічка іноді дає власну прокрутку */
      setHeight(doc.body.scrollHeight + 2);
    };

    measure();

    /* Картинки в листі довантажуються після onLoad і змінюють висоту */
    const doc = frame.contentDocument;
    if (!doc?.body || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(doc.body);
    return () => observer.disconnect();
  }, [html]);

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      title={title}
      sandbox="allow-same-origin allow-popups"
      loading="lazy"
      onLoad={() => {
        const doc = ref.current?.contentDocument;
        if (doc?.body) setHeight(doc.body.scrollHeight + 2);
      }}
      /* До заміру тримаємо невелику висоту: нульова дає стрибок, повна —
         порожню дірку під коротким повідомленням */
      style={{ height: height || 120 }}
      className="w-full border-0"
    />
  );
}
