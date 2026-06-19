import { eq, desc, and } from "drizzle-orm";
import slugify from "slugify";
import { db } from "@/db";
import { memorialPages, type MemorialPage } from "@/db/schema";
import { generatePublicId, parseJsonArray } from "@/lib/utils";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import type { MemorialInput } from "@/lib/validators";
import type { MemorialListItem, MemorialPublicData } from "@/types/memorial";
import {
  deleteOldQrFiles,
  generateQrFiles,
} from "@/services/qr.service";
import {
  deleteUploadedFile,
} from "@/services/upload.service";

function mapToPublicData(page: MemorialPage): MemorialPublicData {
  return {
    id: page.id,
    publicId: page.publicId,
    slug: page.slug,
    fullName: page.fullName,
    birthDate: page.birthDate,
    deathDate: page.deathDate,
    epitaph: page.epitaph,
    biography: page.biography,
    coverPhoto: page.coverPhoto,
    galleryImages: parseJsonArray(page.galleryImages),
    videoUrls: parseJsonArray(page.videoUrls),
    cemeteryLocation: page.cemeteryLocation,
    isPublished: page.isPublished,
  };
}

export function generateSlugFromName(fullName: string): string {
  return slugify(fullName, { lower: true, strict: true, locale: "ru" });
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
      updatedAt: new Date(),
    })
    .returning({ id: memorialPages.id });

  return { success: true, id: created.id };
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

  const gallery = parseJsonArray(existing.galleryImages);
  gallery.push(relativePath);

  await db
    .update(memorialPages)
    .set({
      galleryImages: JSON.stringify(gallery),
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

  const gallery = parseJsonArray(existing.galleryImages).filter(
    (item) => item !== relativePath,
  );

  await deleteUploadedFile(relativePath);

  await db
    .update(memorialPages)
    .set({
      galleryImages: JSON.stringify(gallery),
      updatedAt: new Date(),
    })
    .where(eq(memorialPages.id, id));

  return { success: true };
}

export { mapToPublicData };
