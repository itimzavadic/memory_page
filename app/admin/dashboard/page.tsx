import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { listMemorials } from "@/services/memorial.service";

export default async function AdminDashboardPage() {
  const memorials = await listMemorials();
  const publishedCount = memorials.filter((item) => item.isPublished).length;

  return (
    <>
      <AdminNav />
      <AdminLayout
        title="Панель управления"
        actions={
          <Link
            href="/admin/memorials/create"
            className="inline-flex w-full items-center justify-center rounded bg-memorial-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 sm:w-auto"
          >
            Новая страница
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Всего страниц" value={memorials.length} />
          <StatCard label="Опубликовано" value={publishedCount} />
          <StatCard label="Черновики" value={memorials.length - publishedCount} />
        </div>

        <div className="admin-card mt-8 p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Последние страницы</h2>
          {memorials.length === 0 ? (
            <p className="text-sm text-stone-600">Пока нет созданных страниц памяти.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {memorials.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{item.fullName}</p>
                    <p className="text-xs text-stone-500">
                      {item.isPublished ? "Опубликовано" : "Черновик"}
                    </p>
                  </div>
                  <Link
                    href={`/admin/memorials/${item.id}/edit`}
                    className="inline-flex shrink-0 items-center rounded border border-memorial-accent px-3 py-1.5 text-sm font-medium text-memorial-accent hover:bg-memorial-accent/5"
                  >
                    Редактировать
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-card p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
