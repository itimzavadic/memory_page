"use client";

import type { ElementType } from "@/types/memorial";
import { AttachedMenu } from "@/components/memorial/editor/AttachedMenu";

interface SectionElementFabProps {
  onAddElement: (type: ElementType) => void;
  onDeleteSection?: () => void;
}

const ELEMENT_OPTIONS: { type: ElementType; label: string }[] = [
  { type: "text", label: "+ Текст" },
  { type: "photo", label: "+ Фото" },
  { type: "video", label: "+ Видео" },
];

export function SectionElementFab({ onAddElement, onDeleteSection }: SectionElementFabProps) {
  return (
    <AttachedMenu label="Добавить элемент" placement="below" fullScreenOverlay={false}>
      {(close) => (
        <>
          {ELEMENT_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => {
                onAddElement(opt.type);
                close();
              }}
              className="block w-full px-4 py-2 text-left text-sm transition hover:bg-memorial-bg"
            >
              {opt.label}
            </button>
          ))}
          {onDeleteSection && (
            <button
              type="button"
              onClick={() => {
                onDeleteSection();
                close();
              }}
              className="block w-full border-t border-memorial-border px-4 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
            >
              Удалить
            </button>
          )}
        </>
      )}
    </AttachedMenu>
  );
}
