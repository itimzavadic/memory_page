import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { listMemorials } from "@/services/memorial.service";
import type { MemorialListItem } from "@/types/memorial";

export default async function AdminMemorialsPage() {
  const memorials = await listMemorials();

  return (
    <>
      <AdminNav />
      <AdminLayout
        title="Страницы памяти"
        actions={
          <Link
            href="/admin/memorials/create"
            className="inline-flex w-full items-center justify-center rounded bg-memorial-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 sm:w-auto"
          >
            Создать
          </Link>
        }
      >
        {memorials.length === 0 ? (
          <div className="admin-card px-4 py-8 text-center text-sm text-stone-500">
            Нет страниц памяти
          </div>
        ) : (
          <>
            <ul className="admin-card divide-y divide-stone-100 md:hidden">
              {memorials.map((item) => (
                <MemorialMobileCard key={item.id} item={item} />
              ))}
            </ul>

            <div className="admin-card hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-stone-700">ФИО</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Slug</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Статус</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Public ID</th>
                    <th className="px-4 py-3 font-medium text-stone-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {memorials.map((item) => (
                    <tr key={item.id} className="border-b border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-900">{item.fullName}</td>
                      <td className="px-4 py-3 text-stone-600">{item.slug}</td>
                      <td className="px-4 py-3">
                        <StatusBadge published={item.isPublished} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-stone-500">
                        {item.publicId ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <EditLink id={item.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs ${
        published ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"
      }`}
    >
      {published ? "Опубликовано" : "Черновик"}
    </span>
  );
}

function EditLink({ id, compact = false }: { id: number; compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href={`/admin/memorials/${id}/edit`}
        className="inline-flex shrink-0 items-center rounded bg-memorial-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Редактировать
      </Link>
    );
  }

  return (
    <Link
      href={`/admin/memorials/${id}/edit`}
      className="text-memorial-accent hover:underline"
    >
      Редактировать
    </Link>
  );
}

function MemorialMobileCard({ item }: { item: MemorialListItem }) {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-stone-900">{item.fullName}</p>
          <p className="mt-1 truncate text-xs text-stone-500">{item.slug}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge published={item.isPublished} />
            {item.publicId && (
              <span className="font-mono text-xs text-stone-400">{item.publicId}</span>
            )}
          </div>
        </div>
        <EditLink id={item.id} compact />
      </div>
    </li>
  );
}
