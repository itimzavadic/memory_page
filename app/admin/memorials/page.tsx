import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { listMemorials } from "@/services/memorial.service";

export default async function AdminMemorialsPage() {
  const memorials = await listMemorials();

  return (
    <>
      <AdminNav />
      <AdminLayout
        title="Страницы памяти"
        actions={
          <Link
            href="/admin/memorials/new"
            className="rounded bg-memorial-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Создать
          </Link>
        }
      >
        <div className="admin-card overflow-hidden">
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
              {memorials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    Нет страниц памяти
                  </td>
                </tr>
              ) : (
                memorials.map((item) => (
                  <tr key={item.id} className="border-b border-stone-100">
                    <td className="px-4 py-3 font-medium text-stone-900">{item.fullName}</td>
                    <td className="px-4 py-3 text-stone-600">{item.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          item.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.isPublished ? "Опубликовано" : "Черновик"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">
                      {item.publicId ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/memorials/${item.id}/edit`}
                        className="text-memorial-accent hover:underline"
                      >
                        Редактировать
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </>
  );
}
