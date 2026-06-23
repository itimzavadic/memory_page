import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth.service";
import {
  saveUploadedFile,
  isValidUploadPath,
} from "@/services/upload.service";
import {
  updateCoverPhoto,
  addGalleryImage,
  removeGalleryImage,
  getMemorialById,
} from "@/services/memorial.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const memorialId = Number(formData.get("memorialId"));
  const type = formData.get("type");

  if (!(file instanceof File) || Number.isNaN(memorialId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const memorial = await getMemorialById(memorialId);
  if (!memorial) {
    return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  }

  const upload = await saveUploadedFile(file, { asCover: type === "cover" });
  if (!upload.success || !upload.path) {
    return NextResponse.json({ error: upload.error ?? "Upload failed" }, { status: 400 });
  }

  if (type === "cover") {
    await updateCoverPhoto(memorialId, upload.path);
  } else if (type === "gallery") {
    await addGalleryImage(memorialId, upload.path);
  } else if (type === "element-photo") {
    // element-photo is stored in sections JSON via client autosave; no DB column update needed
  } else {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  return NextResponse.json({ path: upload.path });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const memorialId = Number(body.memorialId);
  const imagePath = String(body.path ?? "");

  if (Number.isNaN(memorialId) || !isValidUploadPath(imagePath)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await removeGalleryImage(memorialId, imagePath);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
