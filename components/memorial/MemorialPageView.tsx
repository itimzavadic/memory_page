"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type {
  BlockElement,
  CustomSectionType,
  ElementType,
  ElementsSection,
  MemorialPublicData,
  MemorialSection,
  SiteSettingsData,
} from "@/types/memorial";
import { isCustomSection } from "@/types/memorial";
import { fileUrl, formatDateRu, generateSlugFromName } from "@/lib/utils";
import { SECTION_TITLES, defaultEpitaphText, canMoveCustomSection } from "@/lib/content-blocks";
import { HERO_PHOTO_BLEED_X, HERO_PHOTO_BLEED_Y, HERO_PHOTO_PADDING_X, HERO_PHOTO_PADDING_Y } from "@/lib/hero-frame";
import { MemorialFooter } from "@/components/memorial/MemorialFooter";
import { GalleryCarousel } from "@/components/memorial/GalleryCarousel";
import { SectionElementFab } from "@/components/memorial/editor/SectionElementFab";
import { GlobalSectionFab } from "@/components/memorial/editor/GlobalSectionFab";
import { TextElementView } from "@/components/memorial/editor/TextElementView";
import { PhotoElementView } from "@/components/memorial/editor/PhotoElementView";
import { VideoElementView } from "@/components/memorial/editor/VideoElementView";
import { ElementDeleteButton } from "@/components/memorial/editor/ElementDeleteButton";
import { SectionReorderControls } from "@/components/memorial/editor/SectionReorderControls";
import { ConfirmDialog } from "@/components/memorial/editor/ConfirmDialog";

const CemeteryMap = dynamic(
  () => import("@/components/memorial/CemeteryMap").then((m) => m.CemeteryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-md border border-memorial-border bg-memorial-bg/30" />
    ),
  },
);

const FRAME_IMAGE = "/assets/frame.webp";

export interface MemorialEditHandlers {
  onFullNameChange: (value: string) => void;
  onHeroTaglineChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onDeathDateChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onCemeteryCoordsChange: (lat: number, lng: number) => void;
  onAddElement: (sectionId: string, type: ElementType) => void;
  onUpdateElement: (sectionId: string, elementId: string, patch: Partial<BlockElement>) => void;
  onRemoveElement: (sectionId: string, elementId: string) => void;
  onSectionTitleChange: (sectionId: string, title: string) => void;
  onGalleryChange: (sectionId: string, patch: { images?: string[]; activeIndex?: number }) => void;
  onAddSection: (type: CustomSectionType) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onRemoveSection: (sectionId: string) => void;
  onCoverFileSelect: (file: File) => void;
  onElementPhotoUpload: (sectionId: string, elementId: string, file: File) => void;
  onGalleryUpload: (sectionId: string, file: File) => void;
  onGalleryRemove: (sectionId: string, path: string) => void;
  onVideoUrlBlur: (sectionId: string, elementId: string, url: string) => void;
}

interface MemorialPageViewProps {
  memorial: MemorialPublicData;
  siteSettings?: SiteSettingsData;
  mode?: "view" | "edit";
  edit?: MemorialEditHandlers;
}

function fullNameToThreeLines(fullName: string): [string, string, string] {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return [parts[0] ?? "", parts[1] ?? "", parts.slice(2).join(" ")];
}

function threeLinesToFullName(lines: [string, string, string]): string {
  return lines.map((part) => part.trim()).filter(Boolean).join(" ");
}

function EditableText({
  value,
  onChange,
  className,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full resize-none border-0 bg-transparent text-center outline-none ring-2 ring-transparent focus:ring-memorial-accent/40 ${className ?? ""}`}
        rows={3}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-0 bg-transparent text-center outline-none ring-2 ring-transparent focus:ring-memorial-accent/40 ${className ?? ""}`}
    />
  );
}

function SectionToolbar({
  section,
  isEdit,
  sections,
  onTitleChange,
  onMove,
  onAddElement,
  onDeleteSection,
}: {
  section: ElementsSection;
  isEdit: boolean;
  sections: MemorialSection[];
  onTitleChange?: (title: string) => void;
  onMove?: (direction: "up" | "down") => void;
  onAddElement?: (type: ElementType) => void;
  onDeleteSection?: () => void;
}) {
  const isCustom = isCustomSection(section);
  const defaultTitle = SECTION_TITLES[section.type];

  if (section.type === "epitaph") return null;
  if (!isEdit && section.type === "biography") return null;

  const titleEl =
    isEdit && isCustom && onTitleChange ? (
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full border-0 bg-transparent text-center text-sm font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-memorial-accent/40"
        placeholder={defaultTitle}
      />
    ) : (
      <h2 className="text-sm font-bold uppercase tracking-wide">{section.title || defaultTitle}</h2>
    );

  const showReorder = isEdit && isCustom && onMove;

  return (
    <div className="relative z-20 mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div className="flex justify-start">
        {showReorder && (
          <SectionReorderControls
            onMove={onMove}
            canMoveUp={canMoveCustomSection(sections, section.id, "up")}
            canMoveDown={canMoveCustomSection(sections, section.id, "down")}
          />
        )}
      </div>
      <div className="min-w-0 text-center">{titleEl}</div>
      <div className="flex justify-end">
        {isEdit && onAddElement && (
          <SectionElementFab
            onAddElement={onAddElement}
            onDeleteSection={onDeleteSection}
          />
        )}
      </div>
    </div>
  );
}

function GalleryToolbar({ isEdit }: { isEdit: boolean }) {
  if (!isEdit) return null;
  return (
    <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div />
      <h2 className="text-center text-sm font-bold uppercase tracking-wide">Галерея</h2>
      <div />
    </div>
  );
}

function sectionWrapperClass(section: MemorialSection, isEdit: boolean): string {
  const base = "mx-auto max-w-2xl px-6 text-center";
  if (!isEdit && section.type === "epitaph") return `${base} pt-10 pb-2`;
  if (!isEdit && section.type === "biography") return `${base} pt-2 pb-10`;
  return `${base} py-10`;
}

export function MemorialPageView({
  memorial,
  siteSettings,
  mode = "view",
  edit,
}: MemorialPageViewProps) {
  const isEdit = mode === "edit" && !!edit;
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [pendingSectionDelete, setPendingSectionDelete] = useState<string | null>(null);

  const framePhoto = fileUrl(memorial.coverPhoto);
  const nameLines = fullNameToThreeLines(memorial.fullName);
  const birthFormatted = formatDateRu(memorial.birthDate);
  const deathFormatted = formatDateRu(memorial.deathDate);

  const lat = memorial.cemeteryLat ? Number(memorial.cemeteryLat) : NaN;
  const lng = memorial.cemeteryLng ? Number(memorial.cemeteryLng) : NaN;
  const hasMapCoords = Number.isFinite(lat) && Number.isFinite(lng);

  function renderElement(section: ElementsSection, element: BlockElement) {
    const isEpitaphText = section.type === "epitaph" && element.type === "text";
    const canDelete = isEdit && !isEpitaphText;

    let content: ReactNode = null;

    switch (element.type) {
      case "text":
        content = (
          <TextElementView
            element={element}
            editable={isEdit}
            variant={section.type === "epitaph" ? "epitaph" : "default"}
            placeholder={defaultEpitaphText(memorial.fullName)}
            onChange={(content) =>
              edit?.onUpdateElement(section.id, element.id, { content })
            }
          />
        );
        break;
      case "photo":
        content = (
          <PhotoElementView
            element={element}
            editable={isEdit}
            onUpload={(file) => edit?.onElementPhotoUpload(section.id, element.id, file)}
          />
        );
        break;
      case "video":
        content = (
          <VideoElementView
            element={element}
            fullName={memorial.fullName}
            editable={isEdit}
            onChange={(url) => edit?.onUpdateElement(section.id, element.id, { url })}
            onBlur={(url) => edit?.onVideoUrlBlur(section.id, element.id, url)}
          />
        );
        break;
    }

    return (
      <div key={element.id} className="relative">
        {content}
        {canDelete && (
          <ElementDeleteButton
            element={element}
            onDelete={() => edit!.onRemoveElement(section.id, element.id)}
          />
        )}
      </div>
    );
  }

  function renderEpitaphSection(section: ElementsSection) {
    const textEl = section.elements.find((e) => e.type === "text");
    if (!textEl) return null;

    return (
      <section className="relative text-center">
        <TextElementView
          element={textEl}
          editable={isEdit}
          variant="epitaph"
          placeholder={defaultEpitaphText(memorial.fullName)}
          onChange={(content) => edit?.onUpdateElement(section.id, textEl.id, { content })}
        />
      </section>
    );
  }

  function renderSection(section: MemorialSection) {
    if (section.type === "gallery") {
      return (
        <section key={section.id} className="group relative">
          <GalleryToolbar isEdit={isEdit} />
          <GalleryCarousel
            section={section}
            editable={isEdit}
            onActiveIndexChange={(index) =>
              edit?.onGalleryChange(section.id, { activeIndex: index })
            }
            onUpload={(file) => edit?.onGalleryUpload(section.id, file)}
            onRemove={(path) => edit?.onGalleryRemove(section.id, path)}
          />
        </section>
      );
    }

    const elementsSection = section as ElementsSection;

    if (section.type === "epitaph") {
      return renderEpitaphSection(elementsSection);
    }

    return (
      <section key={section.id} className="group relative text-left">
        <SectionToolbar
          section={elementsSection}
          isEdit={isEdit}
          sections={memorial.sections}
          onTitleChange={(title) => edit?.onSectionTitleChange(section.id, title)}
          onMove={(direction) => edit?.onMoveSection(section.id, direction)}
          onAddElement={isEdit ? (type) => edit!.onAddElement(section.id, type) : undefined}
          onDeleteSection={
            isEdit && isCustomSection(section)
              ? () => setPendingSectionDelete(section.id)
              : undefined
          }
        />
        <div className="space-y-6">
          {elementsSection.elements.map((el) => renderElement(elementsSection, el))}
        </div>
        {section.type === "cemetery" && (
          <div className="mt-6">
            <CemeteryMap
              lat={lat}
              lng={lng}
              editable={isEdit}
              onLocationChange={(newLat, newLng) =>
                edit?.onCemeteryCoordsChange(newLat, newLng)
              }
            />
            {isEdit && !hasMapCoords && (
              <p className="mt-2 text-center text-xs text-memorial-text/60">
                Перетащите метку или нажмите на карту, чтобы указать место
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  const defaultSiteSettings: SiteSettingsData = {
    companyText: "mp_vobraz — страницы светлой памяти",
    partners: [],
  };

  return (
    <main className="bg-memorial-bg-lower text-memorial-text">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && edit) edit.onCoverFileSelect(file);
          e.target.value = "";
        }}
      />

      <section
        className="memorial-hero flex min-h-[100dvh] flex-col bg-memorial-bg"
        style={
          {
            "--hero-m-photo-padding-x": `${HERO_PHOTO_PADDING_X}px`,
            "--hero-m-photo-padding-y": `${HERO_PHOTO_PADDING_Y}px`,
            "--hero-m-photo-bleed-x": `${HERO_PHOTO_BLEED_X}px`,
            "--hero-m-photo-bleed-y": `${HERO_PHOTO_BLEED_Y}px`,
          } as CSSProperties
        }
      >
        <div className="memorial-hero-content memorial-hero-inner flex min-h-0 flex-1 flex-col">
          <div className="memorial-hero-visual">
            <div className="memorial-frame-composition">
              <div className="memorial-candle pointer-events-none" aria-hidden>
                <Image
                  src="/assets/candle.png"
                  alt=""
                  width={1500}
                  height={1280}
                  unoptimized
                  className="memorial-candle-img"
                  priority
                />
              </div>
              <div className="memorial-frame-fixed pointer-events-none">
                <div className="memorial-frame-photo pointer-events-none">
                  {framePhoto ? (
                    <div className="memorial-frame-photo-inner relative">
                      <Image
                        src={framePhoto}
                        alt={memorial.fullName}
                        fill
                        unoptimized
                        className="memorial-frame-photo-image"
                        sizes="(max-width: 1023px) 85vw, 42vw"
                        priority
                      />
                    </div>
                  ) : null}
                </div>
                <Image
                  src={FRAME_IMAGE}
                  alt=""
                  fill
                  className="memorial-frame-overlay object-contain"
                  aria-hidden
                  priority
                />
              </div>
              {isEdit && (
                <div className="memorial-frame-edit-layer">
                  {framePhoto ? (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="memorial-frame-replace-btn"
                    >
                      Заменить
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="memorial-frame-add-btn"
                      aria-label="Загрузить фото"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="memorial-hero-text">
            {isEdit ? (
              <EditableText
                value={memorial.heroTagline}
                onChange={(value) => edit!.onHeroTaglineChange(value)}
                className="memorial-script memorial-hero-epigraph"
                placeholder="Эпиграф"
              />
            ) : (
              <p className="memorial-script memorial-hero-epigraph">{memorial.heroTagline}</p>
            )}

            {isEdit ? (
              <div className="memorial-name memorial-hero-name w-full">
                {nameLines.map((line, index) => (
                  <input
                    key={index}
                    type="text"
                    value={line}
                    onChange={(e) => {
                      const next = [...nameLines] as [string, string, string];
                      next[index] = e.target.value;
                      const fullName = threeLinesToFullName(next);
                      edit!.onFullNameChange(fullName);
                      edit!.onSlugChange(generateSlugFromName(fullName) || memorial.slug);
                    }}
                    placeholder={["Фамилия", "Имя", "Отчество"][index]}
                    className="w-full border-0 bg-transparent text-center outline-none ring-2 ring-transparent focus:ring-memorial-accent/40"
                  />
                ))}
              </div>
            ) : (
              <div className="memorial-name memorial-hero-name">
                {nameLines.map((part, index) => (
                  <span key={index} className="block min-h-[1.08em]">
                    {part || "\u00A0"}
                  </span>
                ))}
              </div>
            )}

            {isEdit ? (
              <div className="memorial-hero-dates flex flex-wrap items-center justify-center gap-2">
                <input
                  type="date"
                  value={memorial.birthDate}
                  onChange={(e) => edit!.onBirthDateChange(e.target.value)}
                  className="rounded border border-memorial-border/40 bg-white/50 px-2 py-1 text-sm"
                />
                <span>—</span>
                <input
                  type="date"
                  value={memorial.deathDate}
                  onChange={(e) => edit!.onDeathDateChange(e.target.value)}
                  className="rounded border border-memorial-border/40 bg-white/50 px-2 py-1 text-sm"
                />
              </div>
            ) : (
              <p className="memorial-hero-dates">
                {birthFormatted} - {deathFormatted}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="memorial-lower-content">
        {memorial.sections.map((section) => (
          <div key={section.id} className={sectionWrapperClass(section, isEdit)}>
            {renderSection(section)}
          </div>
        ))}

        <MemorialFooter
          siteSettings={siteSettings ?? defaultSiteSettings}
          publicId={memorial.publicId}
          fullName={memorial.fullName}
        />
      </div>

      {isEdit && <GlobalSectionFab onAddSection={(type) => edit!.onAddSection(type)} />}

      <ConfirmDialog
        open={pendingSectionDelete !== null}
        title="Удалить секцию?"
        message="Секция и все её элементы будут удалены без возможности восстановления."
        onConfirm={() => {
          if (pendingSectionDelete) edit?.onRemoveSection(pendingSectionDelete);
          setPendingSectionDelete(null);
        }}
        onCancel={() => setPendingSectionDelete(null)}
      />
    </main>
  );
}
