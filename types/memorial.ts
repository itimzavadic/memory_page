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

export interface MemorialPublicData {
  id: number;
  publicId: string | null;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  epitaph: string | null;
  biography: string | null;
  coverPhoto: string | null;
  galleryImages: string[];
  videoUrls: string[];
  cemeteryLocation: string | null;
  isPublished: boolean;
}
