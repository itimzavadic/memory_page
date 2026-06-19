import fs from "fs/promises";
import path from "path";
import QRCode from "qrcode";
import { getQrTargetUrl } from "@/lib/utils";

const QR_DIR = path.join(process.cwd(), "uploads", "qr");

async function ensureQrDir() {
  await fs.mkdir(QR_DIR, { recursive: true });
}

export async function generateQrFiles(
  publicId: string,
  version: number,
): Promise<{ pngPath: string; svgPath: string; targetUrl: string }> {
  await ensureQrDir();

  const targetUrl = getQrTargetUrl(publicId);
  const baseName = `${publicId}-v${version}`;
  const pngRelative = `qr/${baseName}.png`;
  const svgRelative = `qr/${baseName}.svg`;
  const pngAbsolute = path.join(process.cwd(), "uploads", pngRelative);
  const svgAbsolute = path.join(process.cwd(), "uploads", svgRelative);

  const qrOptions = {
    errorCorrectionLevel: "H" as const,
    margin: 4,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  await QRCode.toFile(pngAbsolute, targetUrl, qrOptions);

  const svgString = await QRCode.toString(targetUrl, {
    ...qrOptions,
    type: "svg",
  });

  const cleanSvg = svgString
    .replace(/<\?xml.*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  await fs.writeFile(svgAbsolute, cleanSvg, "utf-8");

  return {
    pngPath: pngRelative,
    svgPath: svgRelative,
    targetUrl,
  };
}

export async function deleteOldQrFiles(
  pngPath: string | null,
  svgPath: string | null,
): Promise<void> {
  for (const relative of [pngPath, svgPath]) {
    if (!relative) continue;
    const absolute = path.join(process.cwd(), "uploads", relative);
    try {
      await fs.unlink(absolute);
    } catch {
      // file may not exist
    }
  }
}
