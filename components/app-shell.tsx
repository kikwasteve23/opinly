"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/lib/auth-actions";

export function AppShell({
  children,
  email,
  showDeposit,
  locationLabel,
}: {
  children: React.ReactNode;
  email: string;
  showDeposit: boolean;
  locationLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = [
    { href: "/app", label: "Studies" },
    { href: "/app/wallet", label: "Wallet" },
    { href: "/app/referrals", label: "Referrals" },
    { href: "/app/marketers", label: "Marketers" },
    { href: "/app/profile", label: "Profile" },
    ...(showDeposit ? [{ href: "/app/deposit", label: "Deposit funds" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden gap-1 lg:flex">
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
            <span className="hidden text-xs text-gray-500 sm:inline">{locationLabel}</span>
            <span className="hidden text-xs text-gray-500 md:inline">{email}</span>
            <ThemeToggle />
            <form action={logoutAction} className="hidden lg:block">
              <button type="submit" className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200">
                Log out
              </button>
            </form>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-700 lg:hidden dark:text-gray-200"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-gray-100 px-3 py-3 lg:hidden dark:border-gray-800">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-3 text-sm font-medium ${
                  pathname === item.href ? "bg-indigo-50 text-indigo-700" : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button type="submit" className="mt-1 block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-700">
                Log out
              </button>
            </form>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
