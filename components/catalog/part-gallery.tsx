"use client";

import { useState } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/images";
import { YoutubeMark } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function PartGallery({
  photos,
  video,
  alt,
}: {
  photos: string[];
  /** Прев'ю ролика — остання мініатюра в стрічці */
  video?: string;
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const thumbs = video ? [...photos, video] : photos;
  const isVideo = (i: number) => Boolean(video) && i === thumbs.length - 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Квадрат по ширині колонки, а не фіксовані 380 — інакше галерея
          не стискається разом з рештою */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-grey-200 bg-white">
        <Image
          src={thumbs[active]}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
          unoptimized={isRemoteImage(thumbs[active])}
        />
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
