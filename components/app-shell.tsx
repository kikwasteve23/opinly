"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/app", label: "Studies" },
  { href: "/app/wallet", label: "Wallet" },
  { href: "/app/profile", label: "Profile" },
];

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden gap-1 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === item.href ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "text-gray-600 hover:bg-gray-50 dark:text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-gray-500 sm:inline">{email}</span>
            <ThemeToggle />
            <button onClick={() => void logout()} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200">
              Log out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 border-t border-gray-100 px-2 py-2 sm:hidden dark:border-gray-800">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-medium ${
                pathname === item.href ? "bg-indigo-50 text-indigo-700" : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
