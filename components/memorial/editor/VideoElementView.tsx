"use client";

import type { VideoElement } from "@/types/memorial";
import { getVideoEmbedUrl } from "@/lib/utils";

interface VideoElementViewProps {
  element: VideoElement;
  fullName: string;
  editable?: boolean;
  onChange?: (url: string) => void;
  onBlur?: (url: string) => void;
}

export function VideoElementView({
  element,
  fullName,
  editable,
  onChange,
  onBlur,
}: VideoElementViewProps) {
  const embed = element.url ? getVideoEmbedUrl(element.url) : null;

  if (editable) {
    return (
      <div className="space-y-2">
        <input
          type="url"
          value={element.url}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          placeholder="Ссылка на YouTube или Vimeo"
          className="w-full rounded border border-memorial-border/50 bg-white/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-memorial-accent/40"
        />
        {embed && (
          <div
            className="overflow-hidden rounded-md border border-memorial-border bg-black"
            style={{ aspectRatio: element.aspectRatio }}
          >
            <iframe
              src={embed}
              title={`Видео — ${fullName}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    );
  }

  if (!element.url) return null;

  if (embed) {
    return (
      <div
        className="overflow-hidden rounded-md border border-memorial-border bg-black"
        style={{ aspectRatio: element.aspectRatio }}
      >
        <iframe
          src={embed}
          title={`Видео — ${fullName}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a
      href={element.url}
      className="block text-memorial-accent underline"
      target="_blank"
      rel="noreferrer"
    >
      {element.url}
    </a>
  );
}
