const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePublicId(length = 8): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return result;
}

export function getMemorialFramePhotoSize(): { width: number; height: number } {
  const width = Number(process.env.MEMORIAL_FRAME_PHOTO_WIDTH);
  const height = Number(process.env.MEMORIAL_FRAME_PHOTO_HEIGHT);
  return {
    width: Number.isFinite(width) && width > 0 ? width : 492,
    height: Number.isFinite(height) && height > 0 ? height : 680,
  };
}

export function getSiteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

export function getQrTargetUrl(publicId: string): string {
  return `${getSiteUrl()}/m/${publicId}`;
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function formatDateRu(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatLifeYears(birthDate: string, deathDate: string): string {
  const birthYear = birthDate.slice(0, 4);
  const deathYear = deathDate.slice(0, 4);
  if (birthYear && deathYear) return `${birthYear} — ${deathYear}`;
  return `${formatDateRu(birthDate)} — ${formatDateRu(deathDate)}`;
}

export function fileUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  const normalized = relativePath.replace(/^\/+/, "");
  return `/api/files/${normalized}`;
}

export function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}
