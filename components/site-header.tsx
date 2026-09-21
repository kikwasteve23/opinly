"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#studies", label: "The studies" },
  { href: "/#payouts", label: "Getting paid" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader({ signedIn }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-white/85 backdrop-blur dark:bg-gray-950/85 dark:border-gray-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {signedIn ? (
            <Link
              href="/app"
              className="whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:text-indigo-700 sm:block dark:text-gray-200 dark:hover:text-indigo-400"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Create account</span>
              </Link>
            </>
          )}
          <button type="button" className="rounded-lg p-2 text-gray-600 md:hidden dark:text-gray-300" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open ? (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden dark:border-gray-800 dark:bg-gray-950">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              {link.label}
            </Link>
          ))}
          {!signedIn ? (
            <Link href="/login" className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
              Log in
            </Link>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
