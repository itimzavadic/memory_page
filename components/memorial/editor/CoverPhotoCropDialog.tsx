"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  HERO_PHOTO_CROP_ASPECT,
  HERO_PHOTO_CROP_HEIGHT,
  HERO_PHOTO_CROP_WIDTH,
  HERO_PHOTO_OUTPUT_HEIGHT,
  HERO_PHOTO_OUTPUT_WIDTH,
} from "@/lib/hero-frame";
import { getCroppedImage } from "@/lib/crop-image";
import "react-easy-crop/react-easy-crop.css";

interface CoverPhotoCropDialogProps {
  file: File | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}

export function CoverPhotoCropDialog({
  file,
  open,
  onCancel,
  onConfirm,
}: CoverPhotoCropDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!imageUrl || !croppedAreaPixels) return;

    setSaving(true);
    setError(null);
    try {
      const blob = await getCroppedImage(
        imageUrl,
        croppedAreaPixels,
        HERO_PHOTO_OUTPUT_WIDTH,
        HERO_PHOTO_OUTPUT_HEIGHT,
      );
      await onConfirm(blob);
    } catch {
      setError("Не удалось обработать фото");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-base font-semibold text-stone-900">Настроить фото в рамке</h2>
          <p className="mt-1 text-sm text-stone-500">
            Кадр {HERO_PHOTO_CROP_WIDTH}×{HERO_PHOTO_CROP_HEIGHT}px (файл{" "}
            {HERO_PHOTO_OUTPUT_WIDTH}×{HERO_PHOTO_OUTPUT_HEIGHT})
          </p>
        </div>

        <div className="relative h-80 bg-stone-900">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={HERO_PHOTO_CROP_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              Загрузка…
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-stone-200 px-4 py-3">
          <label className="flex items-center gap-3 text-sm text-stone-700">
            <span className="shrink-0">Масштаб</span>
            <input
              type="range"
              min={1}
              max={5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={saving || !croppedAreaPixels}
              className="rounded bg-memorial-accent px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
