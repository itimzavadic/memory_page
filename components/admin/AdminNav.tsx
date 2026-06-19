import Link from "next/link";
import { logoutUser } from "@/services/auth.service";

export function AdminNav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-lg font-semibold text-stone-800">
            mp_vobraz
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/dashboard" className="text-stone-600 hover:text-stone-900">
              Панель
            </Link>
            <Link href="/admin/memorials" className="text-stone-600 hover:text-stone-900">
              Страницы памяти
            </Link>
          </nav>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Выйти
          </button>
        </form>
      </div>
    </header>
  );
}

async function logoutAction() {
  "use server";
  const { redirect } = await import("next/navigation");
  await logoutUser();
  redirect("/admin/login");
}
