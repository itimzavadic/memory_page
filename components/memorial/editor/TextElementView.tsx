"use client";

import type { TextElement } from "@/types/memorial";
import { formatEpitaphText } from "@/lib/content-blocks";

interface TextElementViewProps {
  element: TextElement;
  editable?: boolean;
  onChange?: (content: string) => void;
  variant?: "default" | "epitaph";
  placeholder?: string;
}

export function TextElementView({
  element,
  editable,
  onChange,
  variant = "default",
  placeholder,
}: TextElementViewProps) {
  const isEpitaph = variant === "epitaph";
  const displayContent = isEpitaph ? formatEpitaphText(element.content) : element.content;

  if (editable && onChange) {
    if (isEpitaph) {
      return (
        <textarea
          value={element.content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="memorial-epitaph w-full resize-none border-0 bg-transparent text-center outline-none ring-2 ring-transparent focus:ring-memorial-accent/30"
          rows={2}
        />
      );
    }

    return (
      <div className="rounded-md bg-memorial-bg p-4">
        <textarea
          value={element.content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Текст"}
          className="min-h-24 w-full resize-y border-0 bg-transparent text-left text-base leading-7 outline-none focus:ring-2 focus:ring-memorial-accent/40"
          rows={3}
        />
      </div>
    );
  }

  if (!displayContent.trim()) return null;

  if (isEpitaph) {
    return <p className="memorial-epitaph text-center">{displayContent}</p>;
  }

  return (
    <div className="rounded-md bg-memorial-bg p-4 text-left text-base leading-7">
      {displayContent.split("\n").map((line, i) => (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {line}
        </p>
      ))}
    </div>
  );
}
