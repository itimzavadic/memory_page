import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { memorialPages, type MemorialPage } from "@/db/schema";
import { generatePublicId, parseJsonArray, generateSlugFromName } from "@/lib/utils";
import {
  createDefaultSections,
  createId,
  sectionsFromMemorial,
  syncLegacyFieldsFromSections,
} from "@/lib/content-blocks";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import type { MemorialInput, MemorialAutosaveInput } from "@/lib/validators";
import type {
  BlockElement,
  GallerySection,
  MemorialEditorData,
  MemorialListItem,
  MemorialPublicData,
  MemorialSection,
} from "@/types/memorial";
import {
  deleteOldQrFiles,
  generateQrFiles,
} from "@/services/qr.service";
import {
  deleteUploadedFile,
} from "@/services/upload.service";

function mapToPublicData(page: MemorialPage): MemorialPublicData {
  const sections = sectionsFromMemorial(page);
  const legacy = syncLegacyFieldsFromSections(sections);

  return {
    id: page.id,
    publicId: page.publicId,
    slug: page.slug,
    fullName: page.fullName,
    birthDate: page.birthDate,
    deathDate: page.deathDate,
    heroTagline: page.heroTagline ?? "С любовью светлая память",
    epitaph: legacy.epitaph ?? page.epitaph,
    biography: legacy.biography ?? page.biography,
    coverPhoto: page.coverPhoto,
    galleryImages: legacy.galleryImages.length
      ? legacy.galleryImages
      : parseJsonArray(page.galleryImages),
    videoUrls: legacy.videoUrls.length ? legacy.videoUrls : parseJsonArray(page.videoUrls),
    sections,
    cemeteryLocation: legacy.cemeteryLocation ?? page.cemeteryLocation,
    cemeteryLat: page.cemeteryLat,
    cemeteryLng: page.cemeteryLng,
    isPublished: page.isPublished,
  };
}

export function mapToEditorData(page: MemorialPage): MemorialEditorData {
  return {
    ...mapToPublicData(page),
    qrCodePngPath: page.qrCodePngPath,
    qrCodeSvgPath: page.qrCodeSvgPath,
    qrTargetUrl: page.qrTargetUrl,
  };
}

export async function listMemorials(): Promise<MemorialListItem[]> {
  const rows = await db
    .select()
    .from(memorialPages)
    .orderBy(desc(memorialPages.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    publicId: row.publicId,
    slug: row.slug,
    fullName: row.fullName,
    isPublished: row.isPublished,
    updatedAt: row.updatedAt,
  }));
}

export async function getMemorialById(id: number): Promise<MemorialPage | null> {
  const [row] = await db
    .select()
    .from(memorialPages)
    .where(eq(memorialPages.id, id))
    .limit(1);
  return row ?? null;
}

export async function getMemorialEditorData(id: number): Promise<MemorialEditorData | null> {
  const page = await getMemorialById(id);
  if (!page) return null;
  return mapToEditorData(page);
}

export async function getMemorialByPublicId(
  publicId: string,
): Promise<MemorialPublicData | null> {
  const [row] = await db
    .select()
    .from(memorialPages)
    .where(eq(memorialPages.publicId, publicId))
    .limit(1);

  if (!row || !row.isPublished) return null;
  return mapToPublicData(row);
}

export async function getMemorialBySlug(
  slug: string,
): Promise<MemorialPublicData | null> {
  const [row] = await db
    .select()
    .from(memorialPages)
    .where(and(eq(memorialPages.slug, slug), eq(memorialPages.isPublished, true)))
    .limit(1);

  if (!row) return null;
  return mapToPublicData(row);
}

export async function getPublishedMemorialSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const rows = await db
    .select({
      slug: memorialPages.slug,
      updatedAt: memorialPages.updatedAt,
    })
    .from(memorialPages)
    .where(eq(memorialPages.isPublished, true));

  return rows;
}

async function ensureUniquePublicId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generatePublicId();
    const [existing] = await db
      .select({ id: memorialPages.id })
      .from(memorialPages)
      .where(eq(memorialPages.publicId, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  throw new Error("Не удалось сгенерировать publicId");
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const [existing] = await db
      .select({ id: memorialPages.id })
      .from(memorialPages)
      .where(eq(memorialPages.slug, slug))
      .limit(1);

    if (!existing || existing.id === excludeId) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function sanitizeElement(element: BlockElement): BlockElement {
  switch (element.type) {
    case "text":
      return { ...element, content: sanitizePlainText(element.content) };
    case "photo":
      return element;
    case "video":
      return { ...element, url: element.url.trim() };
  }
}

function sanitizeSections(sections: MemorialSection[]): MemorialSection[] {
  return sections.map((section) => {
    if (section.type === "gallery") {
      return {
        ...section,
        images: section.images.filter((img) => typeof img === "string"),
        activeIndex: Math.min(
          Math.max(0, section.activeIndex),
          Math.max(0, section.images.length - 1),
        ),
      };
    }
    return {
      ...section,
      title: sanitizePlainText(section.title),
      elements: section.elements.map(sanitizeElement),
    };
  });
}

export async function createDraftMemorial(): Promise<{ success: boolean; id?: number }> {
  const fullName = "Имя Фамилия";
  const slug = await ensureUniqueSlug(generateSlugFromName(fullName) || "novaya-stranica");
  const sections = createDefaultSections();
  const legacy = syncLegacyFieldsFromSections(sections);
  const year = new Date().getFullYear();

  const [created] = await db
    .insert(memorialPages)
    .values({
      slug,
      fullName,
      birthDate: `${year - 70}-01-01`,
      deathDate: `${year}-01-01`,
      heroTagline: "С любовью светлая память",
      epitaph: legacy.epitaph,
      biography: legacy.biography,
      galleryImages: JSON.stringify(legacy.galleryImages),
      videoUrls: JSON.stringify(legacy.videoUrls),
      contentBlocks: JSON.stringify(sections),
      updatedAt: new Date(),
    })
    .returning({ id: memorialPages.id });

  return { success: true, id: created.id };
}

export async function createMemorial(
  input: MemorialInput,
): Promise<{ success: boolean; id?: number; error?: string }> {
  const slug = await ensureUniqueSlug(input.slug);

  const [created] = await db
    .insert(memorialPages)
    .values({
      slug,
      fullName: sanitizePlainText(input.fullName),
      birthDate: input.birthDate,
      deathDate: input.deathDate,
      epitaph: sanitizePlainText(input.epitaph),
      biography: sanitizeRichText(input.biography),
      cemeteryLocation: sanitizePlainText(input.cemeteryLocation),
      videoUrls: JSON.stringify(input.videoUrls ?? []),
      contentBlocks: JSON.stringify(createDefaultSections()),
      updatedAt: new Date(),
    })
    .returning({ id: memorialPages.id });

  return { success: true, id: created.id };
}

export async function autosaveMemorial(
  id: number,
  input: MemorialAutosaveInput & { sections?: MemorialSection[] },
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  const slug = await ensureUniqueSlug(input.slug, id);
  const sections = sanitizeSections(
    input.sections ?? sectionsFromMemorial(existing),
  );
  const legacy = syncLegacyFieldsFromSections(sections);

  await db
    .update(memorialPages)
    .set({
      slug,
      fullName: sanitizePlainText(input.fullName),
      birthDate: input.birthDate,
      deathDate: input.deathDate,
      heroTagline: sanitizePlainText(input.heroTagline ?? existing.heroTagline ?? ""),
      epitaph: legacy.epitaph,
      biography: legacy.biography,
      cemeteryLocation: legacy.cemeteryLocation,
      cemeteryLat: input.cemeteryLat?.trim() || null,
      cemeteryLng: input.cemeteryLng?.trim() || null,
      galleryImages: JSON.stringify(legacy.galleryImages),
      videoUrls: JSON.stringify(legacy.videoUrls),
      contentBlocks: JSON.stringify(sections),
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function updateMemorial(
  id: number,
  input: MemorialInput,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  const slug = await ensureUniqueSlug(input.slug, id);

  await db
    .update(memorialPages)
    .set({
      slug,
      fullName: sanitizePlainText(input.fullName),
      birthDate: input.birthDate,
      deathDate: input.deathDate,
      epitaph: sanitizePlainText(input.epitaph),
      biography: sanitizeRichText(input.biography),
      cemeteryLocation: sanitizePlainText(input.cemeteryLocation),
      videoUrls: JSON.stringify(input.videoUrls ?? []),
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function deleteMemorial(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  await deleteOldQrFiles(existing.qrCodePngPath, existing.qrCodeSvgPath);
  await deleteUploadedFile(existing.coverPhoto);

  for (const image of parseJsonArray(existing.galleryImages)) {
    await deleteUploadedFile(image);
  }

  await db.delete(memorialPages).where(eq(memorialPages.id, id));
  return { success: true };
}

export async function publishMemorial(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  let publicId = existing.publicId;
  if (!publicId) {
    publicId = await ensureUniquePublicId();
  }

  const nextVersion = existing.qrVersion > 0 ? existing.qrVersion : 1;
  const qr = await generateQrFiles(publicId, nextVersion);

  await db
    .update(memorialPages)
    .set({
      publicId,
      isPublished: true,
      qrCodePngPath: qr.pngPath,
      qrCodeSvgPath: qr.svgPath,
      qrTargetUrl: qr.targetUrl,
      qrGeneratedAt: new Date(),
      qrVersion: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function unpublishMemorial(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  await db
    .update(memorialPages)
    .set({
      isPublished: false,
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function regenerateQr(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };
  if (!existing.publicId || !existing.isPublished) {
    return { success: false, error: "QR доступен только для опубликованных страниц" };
  }

  await deleteOldQrFiles(existing.qrCodePngPath, existing.qrCodeSvgPath);

  const nextVersion = existing.qrVersion + 1;
  const qr = await generateQrFiles(existing.publicId, nextVersion);

  await db
    .update(memorialPages)
    .set({
      qrCodePngPath: qr.pngPath,
      qrCodeSvgPath: qr.svgPath,
      qrTargetUrl: qr.targetUrl,
      qrGeneratedAt: new Date(),
      qrVersion: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function updateCoverPhoto(
  id: number,
  relativePath: string,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  if (existing.coverPhoto) {
    await deleteUploadedFile(existing.coverPhoto);
  }

  await db
    .update(memorialPages)
    .set({ coverPhoto: relativePath, updatedAt: new Date() })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function addGalleryImage(
  id: number,
  relativePath: string,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  const sections = sectionsFromMemorial(existing);
  const gallerySection = sections.find((s) => s.type === "gallery") as GallerySection | undefined;
  const images = gallerySection ? [...gallerySection.images, relativePath] : [relativePath];

  const updatedSections = gallerySection
    ? sections.map((s) =>
        s.type === "gallery" ? { ...s, images, activeIndex: images.length - 1 } : s,
      )
    : [
        ...sections,
        { id: createId(), type: "gallery" as const, images, activeIndex: 0 },
      ];

  const legacy = syncLegacyFieldsFromSections(updatedSections);

  await db
    .update(memorialPages)
    .set({
      galleryImages: JSON.stringify(legacy.galleryImages),
      contentBlocks: JSON.stringify(updatedSections),
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export async function removeGalleryImage(
  id: number,
  relativePath: string,
): Promise<{ success: boolean; error?: string }> {
  const existing = await getMemorialById(id);
  if (!existing) return { success: false, error: "Страница не найдена" };

  const sections = sectionsFromMemorial(existing).map((section) => {
    if (section.type !== "gallery") return section;
    const images = section.images.filter((img) => img !== relativePath);
    return {
      ...section,
      images,
      activeIndex: Math.min(section.activeIndex, Math.max(0, images.length - 1)),
    };
  });

  const legacy = syncLegacyFieldsFromSections(sections);
  await deleteUploadedFile(relativePath);

  await db
    .update(memorialPages)
    .set({
      galleryImages: JSON.stringify(legacy.galleryImages),
      contentBlocks: JSON.stringify(sections),
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export { mapToPublicData };
