"use client";

import { useRef } from "react";
import type { GallerySection } from "@/types/memorial";
import { fileUrl } from "@/lib/utils";

interface GalleryCarouselProps {
  section: GallerySection;
  editable?: boolean;
  onActiveIndexChange?: (index: number) => void;
  onUpload?: (file: File) => void;
  onRemove?: (path: string) => void;
}

export function GalleryCarousel({
  section,
  editable,
  onActiveIndexChange,
  onUpload,
  onRemove,
}: GalleryCarouselProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { images, activeIndex } = section;
  const safeIndex = images.length > 0 ? Math.min(activeIndex, images.length - 1) : 0;
  const activeImage = images[safeIndex];

  function goPrev() {
    if (images.length === 0) return;
    const next = safeIndex <= 0 ? images.length - 1 : safeIndex - 1;
    onActiveIndexChange?.(next);
  }

  function goNext() {
    if (images.length === 0) return;
    const next = safeIndex >= images.length - 1 ? 0 : safeIndex + 1;
    onActiveIndexChange?.(next);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onUpload) onUpload(file);
          e.target.value = "";
        }}
      />

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-memorial-border bg-memorial-bg/30">
        {activeImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl(activeImage) ?? ""}
              alt="Галерея"
              className="h-full w-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
                  aria-label="Предыдущее фото"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
                  aria-label="Следующее фото"
                >
                  →
                </button>
              </>
            )}
          </>
        ) : editable ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full items-center justify-center text-5xl text-memorial-text/40 hover:text-memorial-accent"
            aria-label="Добавить фото в галерею"
          >
            +
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-memorial-text/50">
            Нет фотографий
          </div>
        )}

        {images.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 overflow-x-auto bg-black/50 p-2 backdrop-blur-sm">
            {images.map((path, index) => (
              <div key={path} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => onActiveIndexChange?.(index)}
                  className={`block h-14 w-14 overflow-hidden rounded border-2 ${
                    index === safeIndex ? "border-white" : "border-transparent opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fileUrl(path) ?? ""} alt="" className="h-full w-full object-cover" />
                </button>
                {editable && onRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(path);
                    }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                    aria-label="Удалить"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {editable && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded border-2 border-dashed border-white/60 text-2xl text-white/80 hover:border-white"
                aria-label="Добавить фото"
              >
                +
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
