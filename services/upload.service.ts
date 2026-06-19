import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "images");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

export async function saveUploadedFile(
  file: File,
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: "Недопустимый тип файла" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Файл слишком большой (макс. 5 МБ)" };
  }

  await ensureUploadDir();

  const ext = MIME_TO_EXT[file.type] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const relativePath = `images/${filename}`;
  const absolutePath = path.join(process.cwd(), "uploads", relativePath);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

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
