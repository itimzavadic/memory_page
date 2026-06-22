import { redirect } from "next/navigation";
import { createDraftMemorial } from "@/services/memorial.service";

export default async function CreateMemorialPage() {
  const result = await createDraftMemorial();
  if (!result.success || !result.id) {
    redirect("/admin/memorials?error=create");
  }
  redirect(`/admin/memorials/${result.id}/edit`);
}
