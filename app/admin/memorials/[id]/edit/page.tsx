import { notFound } from "next/navigation";
import {
  deleteMemorialAction,
  publishMemorialAction,
  regenerateQrAction,
  unpublishMemorialAction,
} from "@/app/admin/actions";
import { MemorialPageEditor } from "@/components/admin/MemorialPageEditor";
import { getMemorialEditorData } from "@/services/memorial.service";

export default async function EditMemorialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) notFound();

  const memorial = await getMemorialEditorData(id);
  if (!memorial) notFound();

  const publishAction = publishMemorialAction.bind(null, id);
  const unpublishAction = unpublishMemorialAction.bind(null, id);
  const deleteAction = deleteMemorialAction.bind(null, id);
  const regenerateAction = regenerateQrAction.bind(null, id);

  return (
    <MemorialPageEditor
      initialData={memorial}
      publishAction={publishAction}
      unpublishAction={unpublishAction}
      deleteAction={deleteAction}
      regenerateQrAction={regenerateAction}
    />
  );
}
