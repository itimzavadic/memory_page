import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/services/auth.service";
import { getMemorialById } from "@/services/memorial.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ memorialId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memorialId: memorialIdParam } = await params;
  const memorialId = Number(memorialIdParam);
  if (Number.isNaN(memorialId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "png";

  const memorial = await getMemorialById(memorialId);
  if (!memorial || !memorial.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const relativePath =
    format === "svg" ? memorial.qrCodeSvgPath : memorial.qrCodePngPath;

  if (!relativePath) {
    return NextResponse.json({ error: "QR not generated" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), "uploads", relativePath);

  try {
    const file = await fs.readFile(absolutePath);
    const ext = format === "svg" ? "svg" : "png";
    const filename = `${memorial.publicId ?? memorial.id}.${ext}`;
    const contentType = format === "svg" ? "image/svg+xml" : "image/png";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
