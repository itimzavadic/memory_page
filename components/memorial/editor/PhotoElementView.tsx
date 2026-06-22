"use client";

import { useRef } from "react";
import type { PhotoElement } from "@/types/memorial";
import { fileUrl } from "@/lib/utils";

interface PhotoElementViewProps {
  element: PhotoElement;
  editable?: boolean;
  onUpload?: (file: File) => void;
}

export function PhotoElementView({ element, editable, onUpload }: PhotoElementViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const src = fileUrl(element.imagePath);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-memorial-border bg-memorial-bg/40">
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
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
          {editable && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
            >
              Заменить
            </button>
          )}
        </>
      ) : editable ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full items-center justify-center text-4xl text-memorial-text/40 hover:text-memorial-accent"
          aria-label="Загрузить фото"
        >
          +
        </button>
      ) : null}
    </div>
  );
}
