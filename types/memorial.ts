export interface MemorialFormData {
  fullName: string;
  slug: string;
  birthDate: string;
  deathDate: string;
  epitaph?: string;
  biography?: string;
  cemeteryLocation?: string;
  videoUrls?: string[];
}

export interface MemorialListItem {
  id: number;
  publicId: string | null;
  slug: string;
  fullName: string;
  isPublished: boolean;
  updatedAt: Date;
}

export type ElementsSectionType =
  | "epitaph"
  | "biography"
  | "cemetery"
  | "wishes"
  | "achievements"
  | "life_dates";

export type CustomSectionType = "wishes" | "achievements" | "life_dates";

export type ElementType = "text" | "photo" | "video";

export interface TextElement {
  id: string;
  type: "text";
  content: string;
}

export interface PhotoElement {
  id: string;
  type: "photo";
  imagePath: string | null;
}

export interface VideoElement {
  id: string;
  type: "video";
  url: string;
  aspectRatio: number;
}

export type BlockElement = TextElement | PhotoElement | VideoElement;

export interface GallerySection {
  id: string;
  type: "gallery";
  images: string[];
  activeIndex: number;
}

export interface ElementsSection {
  id: string;
  type: ElementsSectionType;
  title: string;
  elements: BlockElement[];
}

export type MemorialSection = GallerySection | ElementsSection;

export function isGallerySection(section: MemorialSection): section is GallerySection {
  return section.type === "gallery";
}

export function isElementsSection(section: MemorialSection): section is ElementsSection {
  return section.type !== "gallery";
}

export function isCustomSection(section: MemorialSection): section is ElementsSection {
  return (
    section.type === "wishes" ||
    section.type === "achievements" ||
    section.type === "life_dates"
  );
}

export interface SitePartner {
  name: string;
  url?: string;
}

export interface SiteSettingsData {
  companyText: string;
  partners: SitePartner[];
}

export interface MemorialPublicData {
  id: number;
  publicId: string | null;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  heroTagline: string;
  epitaph: string | null;
  biography: string | null;
  coverPhoto: string | null;
  galleryImages: string[];
  videoUrls: string[];
  sections: MemorialSection[];
  cemeteryLocation: string | null;
  cemeteryLat: string | null;
  cemeteryLng: string | null;
  isPublished: boolean;
}

export interface MemorialEditorData extends MemorialPublicData {
  qrCodePngPath: string | null;
  qrCodeSvgPath: string | null;
  qrTargetUrl: string | null;
}
