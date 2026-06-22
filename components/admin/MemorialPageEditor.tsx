"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { MemorialPageView } from "@/components/memorial/MemorialPageView";
import { QrSection } from "@/components/admin/QrSection";
import { autosaveMemorialAction } from "@/app/admin/actions";
import {
  addCustomSection,
  addElementToSection,
  createElement,
  moveSection,
  removeCustomSection,
  removeElementFromSection,
  syncLegacyFieldsFromSections,
  updateElementInSection,
  updateSection,
} from "@/lib/content-blocks";
import { detectVideoAspectRatio } from "@/lib/video-aspect";
import type {
  BlockElement,
  CustomSectionType,
  ElementType,
  GallerySection,
  MemorialEditorData,
} from "@/types/memorial";

interface MemorialPageEditorProps {
  initialData: MemorialEditorData;
  publishAction: () => Promise<void>;
  unpublishAction: () => Promise<void>;
  deleteAction: () => Promise<void>;
  regenerateQrAction: () => Promise<void>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function MemorialPageEditor({
  initialData,
  publishAction,
  unpublishAction,
  deleteAction,
  regenerateQrAction: regenerateQrFormAction,
}: MemorialPageEditorProps) {
  const [data, setData] = useState(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showSettings, setShowSettings] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveNow = useCallback(async (payload: MemorialEditorData) => {
    setSaveStatus("saving");
    const result = await autosaveMemorialAction(payload.id, {
      fullName: payload.fullName,
      slug: payload.slug,
      birthDate: payload.birthDate,
      deathDate: payload.deathDate,
      heroTagline: payload.heroTagline,
      cemeteryLat: payload.cemeteryLat,
      cemeteryLng: payload.cemeteryLng,
      sections: payload.sections,
    });

    setSaveStatus(result.success ? "saved" : "error");
  }, []);

  const scheduleSave = useCallback(
    (next: MemorialEditorData) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void saveNow(next);
      }, 1500);
    },
    [saveNow],
  );

  const updateData = useCallback(
    (patch: Partial<MemorialEditorData>) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const updateSections = useCallback(
    (updater: (sections: MemorialEditorData["sections"]) => MemorialEditorData["sections"]) => {
      setData((prev) => {
        const sections = updater(prev.sections);
        const legacy = syncLegacyFieldsFromSections(sections);
        const next = {
          ...prev,
          sections,
          epitaph: legacy.epitaph,
          biography: legacy.biography,
          galleryImages: legacy.galleryImages,
          videoUrls: legacy.videoUrls,
          cemeteryLocation: legacy.cemeteryLocation,
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  async function uploadFile(
    file: File,
    type: "cover" | "gallery" | "element-photo",
    extra?: { sectionId?: string; elementId?: string },
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("memorialId", String(data.id));
    formData.append("type", type);
    if (extra?.sectionId) formData.append("sectionId", extra.sectionId);
    if (extra?.elementId) formData.append("elementId", extra.elementId);

    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) {
      setSaveStatus("error");
      return null;
    }
    return result.path as string;
  }

  const editHandlers = {
    onFullNameChange: (value: string) => updateData({ fullName: value }),
    onHeroTaglineChange: (value: string) => updateData({ heroTagline: value }),
    onBirthDateChange: (value: string) => updateData({ birthDate: value }),
    onDeathDateChange: (value: string) => updateData({ deathDate: value }),
    onSlugChange: (value: string) => updateData({ slug: value }),
    onCemeteryCoordsChange: (lat: number, lng: number) =>
      updateData({
        cemeteryLat: String(lat),
        cemeteryLng: String(lng),
      }),
    onAddElement: (sectionId: string, type: ElementType) => {
      updateSections((sections) =>
        addElementToSection(sections, sectionId, createElement(type)),
      );
    },
    onUpdateElement: (sectionId: string, elementId: string, patch: Partial<BlockElement>) => {
      updateSections((sections) =>
        updateElementInSection(sections, sectionId, elementId, patch),
      );
    },
    onRemoveElement: (sectionId: string, elementId: string) => {
      updateSections((sections) =>
        removeElementFromSection(sections, sectionId, elementId),
      );
    },
    onSectionTitleChange: (sectionId: string, title: string) => {
      updateSections((sections) =>
        updateSection(sections, sectionId, { title } as Partial<GallerySection>),
      );
    },
    onGalleryChange: (
      sectionId: string,
      patch: { images?: string[]; activeIndex?: number },
    ) => {
      updateSections((sections) => updateSection(sections, sectionId, patch));
    },
    onAddSection: (type: CustomSectionType) => {
      updateSections((sections) => addCustomSection(sections, type));
    },
    onMoveSection: (sectionId: string, direction: "up" | "down") => {
      updateSections((sections) => moveSection(sections, sectionId, direction));
    },
    onRemoveSection: (sectionId: string) => {
      updateSections((sections) => removeCustomSection(sections, sectionId));
    },
    onCoverUpload: async (file: File) => {
      const path = await uploadFile(file, "cover");
      if (path) updateData({ coverPhoto: path });
    },
    onElementPhotoUpload: async (sectionId: string, elementId: string, file: File) => {
      const path = await uploadFile(file, "element-photo", { sectionId, elementId });
      if (!path) return;
      updateSections((sections) =>
        updateElementInSection(sections, sectionId, elementId, { imagePath: path }),
      );
    },
    onGalleryUpload: async (sectionId: string, file: File) => {
      const path = await uploadFile(file, "gallery");
      if (!path) return;

      updateSections((sections) =>
        sections.map((s) => {
          if (s.id !== sectionId || s.type !== "gallery") return s;
          const images = [...s.images, path];
          return { ...s, images, activeIndex: images.length - 1 };
        }),
      );
    },
    onGalleryRemove: async (sectionId: string, path: string) => {
      await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialId: data.id, path }),
      });

      updateSections((sections) =>
        sections.map((s) => {
          if (s.id !== sectionId || s.type !== "gallery") return s;
          const images = s.images.filter((img) => img !== path);
          return {
            ...s,
            images,
            activeIndex: Math.min(s.activeIndex, Math.max(0, images.length - 1)),
          };
        }),
      );
    },
    onVideoUrlBlur: async (sectionId: string, elementId: string, url: string) => {
      if (!url.trim()) return;
      const aspectRatio = await detectVideoAspectRatio(url);
      updateSections((sections) =>
        updateElementInSection(sections, sectionId, elementId, { aspectRatio }),
      );
    },
  };

  const saveLabel =
    saveStatus === "saving"
      ? "Сохранение…"
      : saveStatus === "saved"
        ? "Сохранено"
        : saveStatus === "error"
          ? "Ошибка сохранения"
          : "";

  return (
    <div className="relative">
      <div className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/memorials"
              className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              К списку
            </Link>
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              Настройки
            </button>
            {data.isPublished && data.publicId && (
              <Link
                href={`/m/${data.publicId}`}
                target="_blank"
                className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
              >
                Предпросмотр
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveLabel && (
              <span
                className={`text-sm ${saveStatus === "error" ? "text-red-600" : "text-stone-500"}`}
              >
                {saveLabel}
              </span>
            )}
            {data.isPublished ? (
              <form action={unpublishAction}>
                <button
                  type="submit"
                  className="rounded border border-amber-300 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-50"
                >
                  Снять с публикации
                </button>
              </form>
            ) : (
              <form action={publishAction}>
                <button
                  type="submit"
                  className="rounded bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                >
                  Опубликовать
                </button>
              </form>
            )}
          </div>
        </div>

        {showSettings && (
          <div className="border-t border-stone-200 bg-stone-50 px-4 py-4">
            <div className="mx-auto max-w-2xl space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Slug (URL)</label>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => updateData({ slug: e.target.value })}
                  className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
              <QrSection
                memorialId={data.id}
                isPublished={data.isPublished}
                publicId={data.publicId}
                qrCodePngPath={data.qrCodePngPath}
                qrTargetUrl={data.qrTargetUrl}
                onRegenerate={regenerateQrFormAction}
              />
              <form action={deleteAction}>
                <button
                  type="submit"
                  className="text-sm text-red-700 hover:underline"
                  onClick={(e) => {
                    if (!confirm("Удалить страницу?")) e.preventDefault();
                  }}
                >
                  Удалить страницу
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <MemorialPageView memorial={data} mode="edit" edit={editHandlers} />
    </div>
  );
}
