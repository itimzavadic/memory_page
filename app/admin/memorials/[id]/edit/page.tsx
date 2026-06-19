import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink, AdminLayout } from "@/components/admin/AdminLayout";
import { MemorialForm } from "@/components/admin/MemorialForm";
import { ImageUploadSection } from "@/components/admin/ImageUploadSection";
import { QrSection } from "@/components/admin/QrSection";
import {
  deleteMemorialAction,
  getMemorialFormValues,
  publishMemorialAction,
  regenerateQrAction,
  unpublishMemorialAction,
  updateMemorialAction,
} from "@/app/admin/actions";
import { getMemorialById } from "@/services/memorial.service";
import { parseJsonArray } from "@/lib/utils";

export default async function EditMemorialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; published?: string; unpublished?: string; qr?: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) notFound();

  const memorial = await getMemorialById(id);
  if (!memorial) notFound();

  const query = await searchParams;
  const initialValues = await getMemorialFormValues(memorial);

  const updateAction = updateMemorialAction.bind(null, id);
  const publishAction = publishMemorialAction.bind(null, id);
  const unpublishAction = unpublishMemorialAction.bind(null, id);
  const deleteAction = deleteMemorialAction.bind(null, id);
  const regenerateAction = regenerateQrAction.bind(null, id);

  return (
    <>
      <AdminNav />
      <AdminLayout
        title={`Редактирование: ${memorial.fullName}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {memorial.isPublished && memorial.publicId && (
              <>
                <Link
                  href={`/m/${memorial.publicId}`}
                  target="_blank"
                  className="rounded border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  Предпросмотр
                </Link>
                <Link
                  href={`/memorial/${memorial.slug}`}
                  target="_blank"
                  className="rounded border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  SEO-страница
                </Link>
              </>
            )}
            {memorial.isPublished ? (
              <form action={unpublishAction}>
                <button
                  type="submit"
                  className="rounded border border-amber-300 px-3 py-2 text-sm text-amber-800 hover:bg-amber-50"
                >
                  Снять с публикации
                </button>
              </form>
            ) : (
              <form action={publishAction}>
                <button
                  type="submit"
                  className="rounded bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
                >
                  Опубликовать
                </button>
              </form>
            )}
            <form action={deleteAction}>
              <button
                type="submit"
                className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Удалить
              </button>
            </form>
          </div>
        }
      >
        <AdminBackLink href="/admin/memorials" label="К списку" />

        {(query.saved || query.published || query.unpublished || query.qr) && (
          <p className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {query.published && "Страница опубликована. QR-код сгенерирован."}
            {query.unpublished && "Страница снята с публикации."}
            {query.saved && "Изменения сохранены."}
            {query.qr && "QR-код перегенерирован."}
          </p>
        )}

        <div className="space-y-6">
          <MemorialForm
            initialValues={initialValues}
            submitLabel="Сохранить"
            action={updateAction}
          />

          <ImageUploadSection
            memorialId={id}
            coverPhoto={memorial.coverPhoto}
            galleryImages={parseJsonArray(memorial.galleryImages)}
          />

          <QrSection
            memorialId={id}
            isPublished={memorial.isPublished}
            publicId={memorial.publicId}
            qrCodePngPath={memorial.qrCodePngPath}
            qrTargetUrl={memorial.qrTargetUrl}
            onRegenerate={regenerateAction}
          />
        </div>
      </AdminLayout>
    </>
  );
}
