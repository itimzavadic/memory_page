"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface AttachedMenuProps {
  label: string;
  size?: "sm" | "lg";
  placement?: "below" | "above";
  /** Полноэкранный оверлей блокирует клики по всей странице — только для глобальной FAB */
  fullScreenOverlay?: boolean;
  children: ReactNode | ((close: () => void) => ReactNode);
}

const BTN_SIZE = {
  sm: "h-9 w-9 text-xl",
  lg: "h-10 w-10 text-2xl",
} as const;

export function AttachedMenu({
  label,
  size = "sm",
  placement = "below",
  fullScreenOverlay = false,
  children,
}: AttachedMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const content = typeof children === "function" ? children(close) : children;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center rounded-full bg-memorial-bg text-memorial-text shadow ring-1 ring-memorial-border/60 transition hover:brightness-95 active:scale-95 ${BTN_SIZE[size]}`}
        aria-label={label}
        aria-expanded={open}
      >
        +
      </button>
      {open && (
        <>
          {fullScreenOverlay && (
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="Закрыть"
              onClick={close}
            />
          )}
          <div
            className={`memorial-panel-enter absolute z-50 min-w-[10rem] overflow-hidden rounded-lg border border-memorial-border bg-white py-1 shadow-lg ${
              placement === "below" ? "right-0 top-full mt-1" : "right-0 bottom-full mb-1"
            }`}
          >
            {content}
          </div>
        </>
      )}
    </div>
  );
}
