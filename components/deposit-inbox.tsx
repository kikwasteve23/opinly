"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSupportReply } from "@/components/admin-support-reply";
import type { ChatShortcut } from "@/lib/types";

export type InboxThread = {
  userId: string;
  name: string;
  email: string;
  location: string;
  lastBody: string;
  lastAt: string;
  waiting: boolean;
  messages: { id: string; from: "user" | "support"; body: string; createdAt: string; adminName: string | null }[];
};

export function DepositInbox({
  threads,
  selectedId,
  shortcuts,
}: {
  threads: InboxThread[];
  selectedId: string | null;
  shortcuts: ChatShortcut[];
}) {
  const open = threads.find((t) => t.userId === selectedId) ?? null;
  const showList = !open;

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-3.25rem)] min-h-[28rem] overflow-hidden border-t border-gray-200 bg-white sm:-mx-8 dark:border-gray-800 dark:bg-gray-950">
      <section
        className={`${showList ? "flex" : "hidden"} w-full flex-col border-r border-gray-200 md:flex md:w-80 md:shrink-0 dark:border-gray-800`}
      >
        <header className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h1 className="text-lg font-extrabold">Deposit chat</h1>
          <p className="text-xs text-gray-500">Tap a name to open the thread.</p>
        </header>
        <ul className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <li className="px-4 py-6 text-sm text-gray-500">No chats yet. They appear when someone opens deposit.</li>
          ) : null}
          {threads.map((t) => {
            const active = open?.userId === t.userId;
            const initial = (t.name || t.email || "?").slice(0, 1).toUpperCase();
            return (
              <li key={t.userId}>
                <Link
                  href={`/admin/support?user=${t.userId}`}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    active ? "bg-indigo-50 dark:bg-indigo-950" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {initial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{t.name || t.email}</span>
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {new Date(t.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-xs text-gray-500">{t.lastBody}</span>
                      {t.waiting ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Needs reply" />
                      ) : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${open ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
        {open ? (
          <>
            <header className="flex items-center gap-3 border-b border-gray-100 px-3 py-3 dark:border-gray-800">
              <Link href="/admin/support" className="rounded-lg p-1 text-gray-600 md:hidden" aria-label="Back to chats">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {(open.name || open.email).slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{open.name || open.email}</p>
                <p className="truncate text-xs text-gray-500">
                  {open.email} · {open.location}
                </p>
              </div>
            </header>
            <ul className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-4 dark:bg-gray-950">
              {open.messages.map((msg) => {
                const mine = msg.from !== "user";
                return (
                  <li key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "rounded-br-sm bg-indigo-600 text-white"
                          : "rounded-bl-sm bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className={`text-[10px] uppercase ${mine ? "text-indigo-100" : "text-gray-400"}`}>
                        {mine ? msg.adminName || "Support" : "Participant"} · {new Date(msg.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <AdminSupportReply userId={open.userId} shortcuts={shortcuts} />
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-sm text-gray-500 md:flex">
            Select a person to read the conversation.
          </div>
        )}
      </section>
    </div>
  );
}
