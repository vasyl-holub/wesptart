"use client";

import { useState } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/images";
import { YoutubeMark } from "@/components/ui/icons";
import { PartImage } from "@/components/catalog/part-image";
import { cn } from "@/lib/cn";

export function PartGallery({
  photos,
  video,
  alt,
  article,
}: {
  photos: string[];
  /** Прев'ю ролика — остання мініатюра в стрічці */
  video?: string;
  alt: string;
  /** Артикул для заглушки, коли фото немає зовсім */
  article?: string;
}) {
  const [active, setActive] = useState(0);
  /* Порожні рядки серед зображень трапляються, та й товар буває зовсім
     без фото. next/image на такому src кидає помилку в консоль і змушує
     браузер тягнути сторінку вдруге, тому відсіюємо їх одразу */
  const thumbs = (video ? [...photos, video] : photos).filter(Boolean);
  const isVideo = (i: number) => Boolean(video) && i === thumbs.length - 1;
  const current = thumbs[Math.min(active, thumbs.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      {/* Квадрат по ширині колонки, а не фіксовані 380 — інакше галерея
          не стискається разом з рештою */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-grey-200 bg-white">
        {current ? (
          <Image
            src={current}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
            unoptimized={isRemoteImage(current)}
          />
        ) : (
          <PartImage
            article={article ?? ""}
            showArticle={Boolean(article)}
            className="size-full rounded-none"
            iconClassName="size-12"
          />
        )}
      </div>

      {thumbs.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {thumbs.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={
                isVideo(i)
                  ? "Відео про товар"
                  : `Фото ${i + 1} з ${photos.length}`
              }
              aria-pressed={active === i}
              className={cn(
                "relative h-[66px] w-20 shrink-0 overflow-hidden rounded-[12px] transition-opacity",
                active === i
                  ? "border-2 border-blue-300"
                  : "border border-grey-200 opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized={isRemoteImage(src)}
              />
              {isVideo(i) && (
                <YoutubeMark className="absolute left-1/2 top-1/2 w-[35px] -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
