import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, actions }: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-stone-900 sm:text-2xl">{title}</h1>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-block text-sm text-stone-500 hover:text-stone-800">
      ← {label}
    </Link>
  );
}
