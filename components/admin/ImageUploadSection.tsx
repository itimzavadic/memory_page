"use client";

import { useState } from "react";
import { fileUrl } from "@/lib/utils";

interface ImageUploadProps {
  memorialId: number;
  coverPhoto: string | null;
  galleryImages: string[];
}

export function ImageUploadSection({
  memorialId,
  coverPhoto,
  galleryImages,
}: ImageUploadProps) {
  const [cover, setCover] = useState(coverPhoto);
  const [gallery, setGallery] = useState(galleryImages);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadFile(file: File, type: "cover" | "gallery") {
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("memorialId", String(memorialId));
    formData.append("type", type);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Ошибка загрузки");
      return;
    }

    if (type === "cover") {
      setCover(data.path);
    } else {
      setGallery((prev) => [...prev, data.path]);
    }
    setMessage("Файл загружен");
  }

  async function removeGalleryImage(path: string) {
    setLoading(true);
    const response = await fetch("/api/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memorialId, path }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Ошибка удаления");
      return;
    }

    setGallery((prev) => prev.filter((item) => item !== path));
    setMessage("Изображение удалено");
  }

  return (
    <div className="admin-card space-y-6 p-6">
      <h2 className="text-lg font-semibold text-stone-900">Изображения</h2>

      <div>
        <p className="mb-2 text-sm font-medium text-stone-700">Обложка</p>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl(cover) ?? ""}
            alt="Обложка"
            className="mb-3 max-h-48 rounded border border-stone-200 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file, "cover");
          }}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-stone-700">Галерея</p>
        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.map((path) => (
            <div key={path} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl(path) ?? ""}
                alt="Галерея"
                className="h-28 w-full rounded border border-stone-200 object-cover"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => void removeGalleryImage(path)}
                className="mt-1 text-xs text-red-700 hover:underline"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file, "gallery");
          }}
        />
      </div>

      {message && <p className="text-sm text-stone-600">{message}</p>}
    </div>
  );
}
