import Link from "next/link";
import { requireAdmin, logoutAction } from "@/lib/auth-actions";
import { Logo } from "@/components/logo";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applicants", label: "Applicants" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/surveys", label: "Surveys" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/withdrawals", label: "Withdrawals" },
  { href: "/admin/reviews", label: "Study reviews" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">Admin</span>
          </div>
          <nav className="flex max-w-full flex-wrap gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{admin.email}</span>
            <form action={logoutAction}>
              <button className="font-semibold">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
