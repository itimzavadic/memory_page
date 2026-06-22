"use client";

import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="memorial-dialog-root fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <button
        type="button"
        className={`memorial-dialog-backdrop absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Закрыть"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`memorial-dialog-panel relative w-full max-w-sm rounded-xl border border-memorial-border bg-white p-6 shadow-2xl transition-all duration-200 ease-out ${
          visible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
        }`}
      >
        <h3 className="memorial-heading text-lg font-semibold text-memorial-text">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-memorial-text/80">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-memorial-border px-4 py-2 text-sm text-memorial-text transition hover:bg-memorial-bg"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-memorial-error px-4 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
