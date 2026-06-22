"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import type { BlockElement } from "@/types/memorial";
import { ConfirmDialog } from "@/components/memorial/editor/ConfirmDialog";

function elementHasContent(element: BlockElement): boolean {
  switch (element.type) {
    case "text":
      return element.content.trim().length > 0;
    case "photo":
      return !!element.imagePath;
    case "video":
      return element.url.trim().length > 0;
  }
}

interface ElementDeleteButtonProps {
  element: BlockElement;
  onDelete: () => void;
}

export function ElementDeleteButton({ element, onDelete }: ElementDeleteButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const needsConfirm = elementHasContent(element);

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (needsConfirm) {
      setConfirmOpen(true);
    } else {
      onDelete();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-memorial-error text-sm font-bold text-white shadow-md transition hover:scale-110 hover:brightness-110 active:scale-95"
        aria-label="Удалить элемент"
      >
        ×
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Удалить элемент?"
        message="Содержимое элемента будет удалено без возможности восстановления."
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
