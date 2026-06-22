import { v4 as uuidv4 } from "uuid";
import type { MemorialPage } from "@/db/schema";
import type {
  BlockElement,
  CustomSectionType,
  ElementType,
  ElementsSection,
  ElementsSectionType,
  GallerySection,
  MemorialSection,
  TextElement,
} from "@/types/memorial";
import { isCustomSection } from "@/types/memorial";
import { parseJsonArray } from "@/lib/utils";

export function createId(): string {
  return uuidv4();
}

export const SECTION_TITLES: Record<ElementsSectionType, string> = {
  epitaph: "Эпитафий",
  biography: "Биография",
  cemetery: "Место захоронения",
  wishes: "Пожелания близких",
  achievements: "Достижения",
  life_dates: "Памятные даты жизни",
};

export const FIXED_SECTION_TYPES: ElementsSectionType[] = [
  "epitaph",
  "biography",
  "cemetery",
];

export function isFixedSectionType(type: string): boolean {
  return type === "epitaph" || type === "biography" || type === "gallery" || type === "cemetery";
}

export function createTextElement(content = ""): TextElement {
  return { id: createId(), type: "text", content };
}

export function createElement(type: ElementType): BlockElement {
  switch (type) {
    case "text":
      return createTextElement("");
    case "photo":
      return { id: createId(), type: "photo", imagePath: null };
    case "video":
      return { id: createId(), type: "video", url: "", aspectRatio: 16 / 9 };
  }
}

export function createElementsSection(
  type: ElementsSectionType,
  elements: BlockElement[] = [],
): ElementsSection {
  return {
    id: createId(),
    type,
    title: SECTION_TITLES[type],
    elements,
  };
}

export function createGallerySection(images: string[] = []): GallerySection {
  return {
    id: createId(),
    type: "gallery",
    images,
    activeIndex: 0,
  };
}

export function createCustomSection(type: CustomSectionType): ElementsSection {
  return createElementsSection(type, []);
}

export function defaultEpitaphText(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/).filter(Boolean)[0];
  return firstName
    ? `ПАМЯТЬ О ${firstName.toLocaleUpperCase("ru-RU")}`
    : "ПАМЯТЬ О ИМЯ";
}

export function formatEpitaphText(text: string): string {
  return text.trim().toLocaleUpperCase("ru-RU");
}

export function createDefaultSections(fullName = ""): MemorialSection[] {
  return [
    createElementsSection("epitaph", [createTextElement(defaultEpitaphText(fullName))]),
    createElementsSection("biography", [
      createTextElement("Расскажите о жизни близкого человека."),
    ]),
    createGallerySection(),
    createElementsSection("cemetery", [createTextElement("")]),
  ];
}

// ── v1 legacy types for migration ──

interface LegacyBlock {
  id: string;
  type: string;
  content?: string;
  title?: string;
  images?: string[];
  url?: string;
}

function isV2Section(value: unknown): value is MemorialSection {
  if (!value || typeof value !== "object") return false;
  const item = value as MemorialSection;
  if (typeof item.id !== "string" || typeof item.type !== "string") return false;
  if (item.type === "gallery") {
    return Array.isArray(item.images) && typeof item.activeIndex === "number";
  }
  return Array.isArray((item as ElementsSection).elements);
}

export function parseSections(raw: string | null | undefined): MemorialSection[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (parsed.every(isV2Section)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function migrateV1ToV2(legacy: LegacyBlock[], page: MemorialPage): MemorialSection[] {
  const sections: MemorialSection[] = [];
  const looseVideos: string[] = [];

  for (const block of legacy) {
    switch (block.type) {
      case "epitaph":
        sections.push(
          createElementsSection("epitaph", [
            createTextElement(block.content ?? ""),
          ]),
        );
        break;
      case "biography":
        sections.push(
          createElementsSection("biography", [
            createTextElement(stripHtml(block.content ?? "")),
          ]),
        );
        break;
      case "gallery":
        sections.push({
          id: block.id || createId(),
          type: "gallery",
          images: block.images ?? [],
          activeIndex: 0,
        });
        break;
      case "text":
        sections.push(
          createElementsSection("wishes", [
            createTextElement(`${block.title ?? ""}\n${stripHtml(block.content ?? "")}`.trim()),
          ]),
        );
        break;
      case "video":
        if (block.url) looseVideos.push(block.url);
        break;
      default:
        break;
    }
  }

  const galleryFromDb = parseJsonArray(page.galleryImages);
  if (!sections.some((s) => s.type === "gallery")) {
    sections.push(createGallerySection(galleryFromDb));
  }

  if (!sections.some((s) => s.type === "epitaph")) {
    sections.unshift(
      createElementsSection("epitaph", [
        createTextElement(page.epitaph ?? ""),
      ]),
    );
  }

  if (!sections.some((s) => s.type === "biography")) {
    const bioIdx = sections.findIndex((s) => s.type === "gallery");
    const bioElements = [
      createTextElement(stripHtml(page.biography ?? "")),
      ...looseVideos.map((url) => ({
        id: createId(),
        type: "video" as const,
        url,
        aspectRatio: 16 / 9,
      })),
    ];
    sections.splice(bioIdx >= 0 ? bioIdx : sections.length, 0, createElementsSection("biography", bioElements));
  } else if (looseVideos.length > 0) {
    const bio = sections.find((s) => s.type === "biography") as ElementsSection | undefined;
    if (bio) {
      bio.elements.push(
        ...looseVideos.map((url) => ({
          id: createId(),
          type: "video" as const,
          url,
          aspectRatio: 16 / 9,
        })),
      );
    }
  }

  const cemeteryElements: BlockElement[] = [];
  if (page.cemeteryLocation) {
    cemeteryElements.push(createTextElement(page.cemeteryLocation));
  }
  if (!sections.some((s) => s.type === "cemetery")) {
    const galleryIdx = sections.findIndex((s) => s.type === "gallery");
    sections.splice(
      galleryIdx >= 0 ? galleryIdx + 1 : sections.length,
      0,
      createElementsSection("cemetery", cemeteryElements),
    );
  }

  return ensureFixedSections(sections);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function ensureEpitaphSection(
  sections: MemorialSection[],
  fullName = "",
): MemorialSection[] {
  return sections.map((section) => {
    if (section.type !== "epitaph") return section;
    const textElements = section.elements.filter((e) => e.type === "text");
    const epitaphText =
      textElements[0] ?? createTextElement(defaultEpitaphText(fullName));
    return {
      ...section,
      elements: [epitaphText],
    };
  });
}

function ensureFixedSections(
  sections: MemorialSection[],
  fullName = "",
): MemorialSection[] {
  const result = [...sections];

  if (!result.some((s) => s.type === "epitaph")) {
    result.unshift(createElementsSection("epitaph", []));
  }
  if (!result.some((s) => s.type === "biography")) {
    const epitaphIdx = result.findIndex((s) => s.type === "epitaph");
    result.splice(
      epitaphIdx >= 0 ? epitaphIdx + 1 : 0,
      0,
      createElementsSection("biography", []),
    );
  }
  if (!result.some((s) => s.type === "gallery")) {
    const bioIdx = result.findIndex((s) => s.type === "biography");
    result.splice(bioIdx >= 0 ? bioIdx + 1 : result.length, 0, createGallerySection());
  }
  if (!result.some((s) => s.type === "cemetery")) {
    const galleryIdx = result.findIndex((s) => s.type === "gallery");
    result.splice(
      galleryIdx >= 0 ? galleryIdx + 1 : result.length,
      0,
      createElementsSection("cemetery", []),
    );
  }

  return ensureEpitaphSection(result, fullName);
}

export function sectionsFromMemorial(page: MemorialPage): MemorialSection[] {
  const fullName = page.fullName ?? "";
  const stored = parseSections(page.contentBlocks);
  if (stored.length > 0) return ensureFixedSections(stored, fullName);

  try {
    const parsed = JSON.parse(page.contentBlocks || "[]");
    if (Array.isArray(parsed) && parsed.length > 0 && !isV2Section(parsed[0])) {
      return ensureFixedSections(migrateV1ToV2(parsed as LegacyBlock[], page), fullName);
    }
  } catch {
    // fall through
  }

  if (page.epitaph || page.biography || page.cemeteryLocation) {
    return ensureFixedSections(migrateV1ToV2([], page), fullName);
  }

  return createDefaultSections(fullName);
}

export function syncLegacyFieldsFromSections(sections: MemorialSection[]): {
  epitaph: string | null;
  biography: string | null;
  galleryImages: string[];
  videoUrls: string[];
  cemeteryLocation: string | null;
} {
  const epitaphSection = sections.find((s) => s.type === "epitaph") as ElementsSection | undefined;
  const bioSection = sections.find((s) => s.type === "biography") as ElementsSection | undefined;
  const cemeterySection = sections.find((s) => s.type === "cemetery") as ElementsSection | undefined;
  const gallerySection = sections.find((s) => s.type === "gallery") as GallerySection | undefined;

  const textFromSection = (section?: ElementsSection) =>
    section?.elements
      .filter((e): e is TextElement => e.type === "text")
      .map((e) => e.content.trim())
      .filter(Boolean)
      .join("\n\n") || null;

  const allVideos = sections
    .filter(isElementsSection)
    .flatMap((s) => s.elements)
    .filter((e): e is BlockElement & { type: "video" } => e.type === "video")
    .map((e) => e.url)
    .filter(Boolean);

  return {
    epitaph: textFromSection(epitaphSection),
    biography: textFromSection(bioSection),
    galleryImages: gallerySection?.images ?? [],
    videoUrls: allVideos,
    cemeteryLocation: textFromSection(cemeterySection),
  };
}

export function updateSection(
  sections: MemorialSection[],
  sectionId: string,
  patch: Partial<MemorialSection>,
): MemorialSection[] {
  return sections.map((s) => (s.id === sectionId ? ({ ...s, ...patch } as MemorialSection) : s));
}

export function addElementToSection(
  sections: MemorialSection[],
  sectionId: string,
  element: BlockElement,
): MemorialSection[] {
  return sections.map((s) => {
    if (s.id !== sectionId || s.type === "gallery") return s;
    return { ...s, elements: [...s.elements, element] };
  });
}

export function updateElementInSection(
  sections: MemorialSection[],
  sectionId: string,
  elementId: string,
  patch: Partial<BlockElement>,
): MemorialSection[] {
  return sections.map((s) => {
    if (s.id !== sectionId || s.type === "gallery") return s;
    return {
      ...s,
      elements: s.elements.map((el) =>
        el.id === elementId ? ({ ...el, ...patch } as BlockElement) : el,
      ),
    };
  });
}

export function removeElementFromSection(
  sections: MemorialSection[],
  sectionId: string,
  elementId: string,
): MemorialSection[] {
  return sections.map((s) => {
    if (s.id !== sectionId || s.type === "gallery") return s;
    if (s.type === "epitaph") {
      const target = s.elements.find((el) => el.id === elementId);
      if (target?.type === "text") return s;
    }
    return { ...s, elements: s.elements.filter((el) => el.id !== elementId) };
  });
}

export function canMoveCustomSection(
  sections: MemorialSection[],
  sectionId: string,
  direction: "up" | "down",
): boolean {
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx < 0 || !isCustomSection(sections[idx])) return false;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  return targetIdx >= 0 && targetIdx < sections.length;
}

export function addCustomSection(
  sections: MemorialSection[],
  type: CustomSectionType,
): MemorialSection[] {
  return [...sections, createCustomSection(type)];
}

export function removeCustomSection(
  sections: MemorialSection[],
  sectionId: string,
): MemorialSection[] {
  return sections.filter((s) => s.id !== sectionId || !isCustomSection(s));
}

export function moveSection(
  sections: MemorialSection[],
  sectionId: string,
  direction: "up" | "down",
): MemorialSection[] {
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx < 0 || !isCustomSection(sections[idx])) return sections;

  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sections.length) return sections;

  const next = [...sections];
  [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
  return next;
}

export function isElementsSection(
  section: MemorialSection,
): section is ElementsSection {
  return section.type !== "gallery";
}
