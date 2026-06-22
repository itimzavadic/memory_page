"use client";

import type { ElementType } from "@/types/memorial";

interface ElementToolPanelProps {
  onAdd: (type: ElementType) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const ELEMENT_OPTIONS: { type: ElementType; label: string }[] = [
  { type: "text", label: "+ Текст" },
  { type: "photo", label: "+ Фото" },
  { type: "video", label: "+ Видео" },
];

export function ElementToolPanel({ onAdd, onRemove, showRemove }: ElementToolPanelProps) {
  return (
    <div className="absolute right-0 top-10 z-20 min-w-[9rem] rounded-xl border border-memorial-border bg-white py-1 shadow-xl">
      {ELEMENT_OPTIONS.map((opt) => (
        <button
          key={opt.type}
          type="button"
          onClick={() => onAdd(opt.type)}
          className="block w-full px-3 py-2 text-left text-sm hover:bg-memorial-bg"
        >
          {opt.label}
        </button>
      ))}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="block w-full border-t border-memorial-border px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
        >
          Удалить элемент
        </button>
      )}
    </div>
  );
}
