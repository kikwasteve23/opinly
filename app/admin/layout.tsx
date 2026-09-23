import { requireAdmin, logoutAction } from "@/lib/auth-actions";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      <aside className="flex w-44 shrink-0 flex-col border-r border-gray-200 bg-white sm:w-56 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-4 sm:px-4 dark:border-gray-800">
          <Logo />
          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
            Admin
          </span>
        </div>
        <div className="flex flex-1 flex-col p-3">
          <AdminNav />
        </div>
        <div className="border-t border-gray-100 p-4 text-sm dark:border-gray-800">
          <p className="truncate text-xs text-gray-500">{admin.email}</p>
          <form action={logoutAction} className="mt-2">
            <button className="font-semibold text-gray-800 dark:text-gray-100">Log out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
