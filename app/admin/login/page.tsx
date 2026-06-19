import Link from "next/link";
import { loginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params.error === "credentials"
      ? "Неверный email или пароль"
      : params.error === "invalid"
        ? "Проверьте введённые данные"
        : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="admin-card w-full max-w-md p-8">
        <h1 className="mb-2 text-2xl font-semibold text-stone-900">mp_vobraz</h1>
        <p className="mb-6 text-sm text-stone-600">Вход в админ-панель</p>

        {errorMessage && (
          <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errorMessage}
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-stone-700">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-stone-700">Пароль</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded border border-stone-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded bg-memorial-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Войти
          </button>
        </form>

        <Link href="/" className="mt-6 inline-block text-sm text-stone-500 hover:text-stone-800">
          ← На главную
        </Link>
      </div>
    </div>
  );
}
