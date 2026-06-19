"use client";

import { fileUrl } from "@/lib/utils";

interface QrSectionProps {
  memorialId: number;
  isPublished: boolean;
  publicId: string | null;
  qrCodePngPath: string | null;
  qrTargetUrl: string | null;
  onRegenerate: () => Promise<void>;
}

export function QrSection({
  memorialId,
  isPublished,
  publicId,
  qrCodePngPath,
  qrTargetUrl,
  onRegenerate,
}: QrSectionProps) {
  if (!isPublished || !publicId) {
    return (
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-stone-900">QR-код</h2>
        <p className="mt-2 text-sm text-stone-600">
          Опубликуйте страницу, чтобы сгенерировать QR-код для таблички.
        </p>
      </div>
    );
  }

  const pngUrl = fileUrl(qrCodePngPath);

  return (
    <div className="admin-card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-stone-900">QR-код</h2>
      <p className="text-sm text-stone-600">
        Постоянная ссылка:{" "}
        <a href={qrTargetUrl ?? "#"} className="text-memorial-accent underline" target="_blank" rel="noreferrer">
          {qrTargetUrl}
        </a>
      </p>

      {pngUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pngUrl} alt="QR-код" className="h-48 w-48 border border-stone-200 bg-white p-2" />
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/qr/${memorialId}?format=png`}
          className="rounded border border-memorial-accent px-4 py-2 text-sm text-memorial-accent hover:bg-teal-50"
        >
          Скачать PNG
        </a>
        <a
          href={`/api/qr/${memorialId}?format=svg`}
          className="rounded border border-memorial-accent px-4 py-2 text-sm text-memorial-accent hover:bg-teal-50"
        >
          Скачать SVG
        </a>
        <form action={onRegenerate}>
          <button
            type="submit"
            className="rounded border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Перегенерировать
          </button>
        </form>
      </div>
    </div>
  );
}
