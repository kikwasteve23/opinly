"use client";

import { useEffect, useState } from "react";
import { Menu, PanelLeftClose, X } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin-nav";

export function AdminShell({
  email,
  waitingChats,
  children,
}: {
  email: string;
  waitingChats: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("opinly-admin-sidebar");
    if (stored === "closed") setDesktopOpen(false);
  }, []);

  function toggleDesktop() {
    setDesktopOpen((open) => {
      const next = !open;
      window.localStorage.setItem("opinly-admin-sidebar", next ? "open" : "closed");
      return next;
    });
  }

  const sidebar = (
    <div className="flex h-full w-56 flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-4 dark:border-gray-800">
        <div className="flex min-w-0 items-center gap-2">
          <Logo />
          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
            Admin
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <AdminNav waitingChats={waitingChats} onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="border-t border-gray-100 p-4 text-sm dark:border-gray-800">
        <p className="truncate text-xs text-gray-500">{email}</p>
        <form action={logoutAction} className="mt-2">
          <button className="font-semibold text-gray-800 dark:text-gray-100">Log out</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      <aside
        className={`hidden shrink-0 overflow-hidden border-r border-gray-200 transition-[width] duration-300 ease-out dark:border-gray-800 lg:block ${
          desktopOpen ? "w-56" : "w-0 border-r-0"
        }`}
      >
        <div className="h-full w-56">{sidebar}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-56 translate-x-0 shadow-2xl transition-transform">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:inline-flex dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={toggleDesktop}
            aria-label={desktopOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {desktopOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Operations</p>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
