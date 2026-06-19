import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink, AdminLayout } from "@/components/admin/AdminLayout";
import { MemorialForm } from "@/components/admin/MemorialForm";
import { createMemorialAction } from "@/app/admin/actions";

export default async function NewMemorialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params.error === "validation"
      ? "Проверьте поля формы: ФИО, slug (латиница), даты."
      : params.error === "failed"
        ? "Не удалось создать страницу. Попробуйте снова."
        : null;

  return (
    <>
      <AdminNav />
      <AdminLayout title="Новая страница памяти">
        <AdminBackLink href="/admin/memorials" label="К списку" />
        {errorMessage && (
          <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errorMessage}
          </p>
        )}
        <MemorialForm submitLabel="Создать страницу" action={createMemorialAction} />
      </AdminLayout>
    </>
  );
}
