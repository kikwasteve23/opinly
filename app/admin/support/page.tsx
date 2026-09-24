import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { AdminSupportReply } from "@/components/admin-support-reply";
import { LiveRefresh } from "@/components/live-refresh";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  await requireAdmin();
  const { user: selectedId } = await searchParams;
  const store = await readStoreSnapshot();
  const byUser = new Map<string, typeof store.chat>();
  for (const msg of store.chat) {
    const list = byUser.get(msg.userId) ?? [];
    list.push(msg);
    byUser.set(msg.userId, list);
  }
  const threads = [...byUser.entries()]
    .map(([userId, messages]) => {
      const person = store.users.find((u) => u.id === userId);
      const last = messages[messages.length - 1]!;
      const waiting = last.from === "user";
      return { userId, person, messages, last, waiting };
    })
    .sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt));
  const open = threads.find((t) => t.userId === selectedId) ?? threads[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <LiveRefresh ms={2500} />
      <div>
        <h1 className="text-2xl font-extrabold">Deposit chat</h1>
        <p className="mt-1 mb-4 text-sm text-gray-600">Live threads from people on the deposit page. Reply here — they see it in a few seconds.</p>
        <ul className="space-y-1">
          {threads.length === 0 ? <li className="text-sm text-gray-500">No deposit chats yet.</li> : null}
          {threads.map((t) => (
            <li key={t.userId}>
              <Link
                href={`/admin/support?user=${t.userId}`}
                className={`block rounded-xl px-3 py-2 text-sm ${
                  open?.userId === t.userId ? "bg-indigo-50 font-semibold text-indigo-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{t.person?.email ?? t.userId}</span>
                  {t.waiting ? <span className="rounded bg-amber-100 px-1.5 text-[10px] font-bold uppercase text-amber-900">Needs reply</span> : null}
                </span>
                <span className="mt-0.5 block truncate text-xs font-normal text-gray-500">{t.last.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        {open ? (
          <>
            <h2 className="font-semibold">{open.person?.profile?.legalName || open.person?.email}</h2>
            <p className="text-xs text-gray-500">
              {open.person?.email} · {open.person?.profile?.country || open.person?.detectedCountry || "Unknown"}
            </p>
            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-auto text-sm">
              {open.messages.map((msg) => (
                <li key={msg.id} className={`rounded-xl px-3 py-2 ${msg.from === "user" ? "bg-indigo-50 dark:bg-indigo-950" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <p className="text-[11px] uppercase text-gray-500">
                    {msg.from === "user" ? "Participant" : msg.adminName || "Staff"} · {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  {msg.body}
                </li>
              ))}
            </ul>
            <AdminSupportReply userId={open.userId} />
          </>
        ) : (
          <p className="text-sm text-gray-500">Open a thread to reply.</p>
        )}
      </div>
    </div>
  );
}
