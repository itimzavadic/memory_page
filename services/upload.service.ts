import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import {
  HERO_PHOTO_JPEG_QUALITY,
  HERO_PHOTO_OUTPUT_HEIGHT,
  HERO_PHOTO_OUTPUT_WIDTH,
} from "@/lib/hero-frame";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "images");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
/** Обложка после crop: 1164×1608 JPEG 95% может быть крупнее обычных загрузок. */
const MAX_COVER_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function validateRelativePath(relativePath: string): boolean {
  if (!relativePath || relativePath.includes("..")) return false;
  const normalized = path.normalize(relativePath);
  return !normalized.startsWith("..") && normalized.startsWith("images/");
}

export interface SaveUploadOptions {
  /** Обложка hero: сохранить без повторного JPEG (уже обработана в crop-редакторе). */
  asCover?: boolean;
}

/** Обложка приходит из crop-редактора уже нужного размера и качества — не пережимаем. */
async function normalizeCoverBuffer(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const matchesTarget =
    width === HERO_PHOTO_OUTPUT_WIDTH && height === HERO_PHOTO_OUTPUT_HEIGHT;

  if (matchesTarget) {
    return buffer;
  }

  return sharp(buffer)
    .rotate()
    .resize(HERO_PHOTO_OUTPUT_WIDTH, HERO_PHOTO_OUTPUT_HEIGHT, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: HERO_PHOTO_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

export async function saveUploadedFile(
  file: File,
  options?: SaveUploadOptions,
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: "Недопустимый тип файла" };
  }

  const maxSize = options?.asCover ? MAX_COVER_FILE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return { success: false, error: `Файл слишком большой (макс. ${maxMb} МБ)` };
  }

  await ensureUploadDir();

  const ext = options?.asCover ? ".jpg" : (MIME_TO_EXT[file.type] ?? ".jpg");
  const filename = `${randomUUID()}${ext}`;
  const relativePath = `images/${filename}`;
  const absolutePath = path.join(process.cwd(), "uploads", relativePath);

  const buffer = Buffer.from(await file.arrayBuffer());
  const output = options?.asCover ? await normalizeCoverBuffer(buffer) : buffer;

  await fs.writeFile(absolutePath, output);

  return { success: true, path: relativePath };
}

export async function deleteUploadedFile(
  relativePath: string | null | undefined,
): Promise<void> {
  if (!relativePath || !validateRelativePath(relativePath)) return;

  const absolutePath = path.join(process.cwd(), "uploads", relativePath);
  try {
    await fs.unlink(absolutePath);
  } catch {
    // ignore
  }
}

export function isValidUploadPath(relativePath: string): boolean {
  return validateRelativePath(relativePath);
}

export function getAbsoluteUploadPath(relativePath: string): string | null {
  if (!validateRelativePath(relativePath)) return null;
  return path.join(process.cwd(), "uploads", relativePath);
}
