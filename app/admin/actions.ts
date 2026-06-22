"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginSchema, memorialSchema, memorialAutosaveSchema } from "@/lib/validators";
import { loginUser } from "@/services/auth.service";
import { generateSlugFromName } from "@/lib/utils";
import {
  autosaveMemorial,
  createDraftMemorial,
  createMemorial,
  updateMemorial,
  deleteMemorial,
  publishMemorial,
  unpublishMemorial,
  regenerateQr,
} from "@/services/memorial.service";
import type { MemorialSection } from "@/types/memorial";
import { parseJsonArray } from "@/lib/utils";

function parseVideoUrls(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
}

function parseMemorialForm(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug && fullName) {
    slug = generateSlugFromName(fullName);
  }

  const videoUrls = parseVideoUrls(formData.get("videoUrls") as string | null);
  return memorialSchema.safeParse({
    fullName,
    slug,
    birthDate: formData.get("birthDate"),
    deathDate: formData.get("deathDate"),
    epitaph: formData.get("epitaph") || undefined,
    biography: formData.get("biography") || undefined,
    cemeteryLocation: formData.get("cemeteryLocation") || undefined,
    videoUrls,
  });
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  const result = await loginUser(parsed.data.email, parsed.data.password);
  if (!result.success) {
    redirect("/admin/login?error=credentials");
  }

  redirect("/admin/dashboard");
}

export async function createDraftMemorialAction() {
  const result = await createDraftMemorial();
  if (!result.success || !result.id) {
    redirect("/admin/memorials?error=create");
  }

  revalidatePath("/admin/memorials");
  redirect(`/admin/memorials/${result.id}/edit`);
}

export async function createMemorialAction(formData: FormData) {
  const parsed = parseMemorialForm(formData);
  if (!parsed.success) {
    redirect("/admin/memorials/new?error=validation");
  }

  const result = await createMemorial(parsed.data);
  if (!result.success || !result.id) {
    redirect("/admin/memorials/new?error=failed");
  }

  revalidatePath("/admin/memorials");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/memorials/${result.id}/edit`);
}

export async function autosaveMemorialAction(
  id: number,
  payload: {
    fullName: string;
    slug: string;
    birthDate: string;
    deathDate: string;
    heroTagline?: string;
    cemeteryLocation?: string;
    cemeteryLat?: string | null;
    cemeteryLng?: string | null;
    sections: MemorialSection[];
  },
): Promise<{ success: boolean; error?: string }> {
  const parsed = memorialAutosaveSchema.safeParse({
    ...payload,
    sections: payload.sections,
  });

  if (!parsed.success) {
    return { success: false, error: "Ошибка валидации" };
  }

  const result = await autosaveMemorial(id, {
    ...parsed.data,
    sections: payload.sections,
  });

  if (result.success) {
    revalidatePath(`/admin/memorials/${id}/edit`);
    revalidatePath("/admin/memorials");
  }

  return result;
}

export async function updateMemorialAction(id: number, formData: FormData) {
  const parsed = parseMemorialForm(formData);
  if (!parsed.success) {
    redirect(`/admin/memorials/${id}/edit?error=validation`);
  }

  const result = await updateMemorial(id, parsed.data);
  if (!result.success) {
    redirect(`/admin/memorials/${id}/edit?error=failed`);
  }

  revalidatePath(`/admin/memorials/${id}/edit`);
  revalidatePath("/admin/memorials");
  redirect(`/admin/memorials/${id}/edit?saved=1`);
}

export async function deleteMemorialAction(id: number) {
  await deleteMemorial(id);
  revalidatePath("/admin/memorials");
  redirect("/admin/memorials");
}

export async function publishMemorialAction(id: number) {
  await publishMemorial(id);
  revalidatePath(`/admin/memorials/${id}/edit`);
  revalidatePath("/admin/memorials");
  redirect(`/admin/memorials/${id}/edit?published=1`);
}

export async function unpublishMemorialAction(id: number) {
  await unpublishMemorial(id);
  revalidatePath(`/admin/memorials/${id}/edit`);
  revalidatePath("/admin/memorials");
  redirect(`/admin/memorials/${id}/edit?unpublished=1`);
}

export async function regenerateQrAction(id: number) {
  await regenerateQr(id);
  revalidatePath(`/admin/memorials/${id}/edit`);
  redirect(`/admin/memorials/${id}/edit?qr=1`);
}

export async function getMemorialFormValues(memorial: {
  fullName: string;
  slug: string;
  birthDate: string;
  deathDate: string;
  epitaph: string | null;
  biography: string | null;
  cemeteryLocation: string | null;
  videoUrls: string | null;
}) {
  return {
    fullName: memorial.fullName,
    slug: memorial.slug,
    birthDate: memorial.birthDate,
    deathDate: memorial.deathDate,
    epitaph: memorial.epitaph ?? "",
    biography: memorial.biography ?? "",
    cemeteryLocation: memorial.cemeteryLocation ?? "",
    videoUrls: parseJsonArray(memorial.videoUrls).join("\n"),
  };
}
