import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { DepositInbox } from "@/components/deposit-inbox";
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
      return {
        userId,
        name: person?.profile?.legalName || person?.email || userId,
        email: person?.email ?? userId,
        location: person?.profile?.country || person?.detectedCountry || "Unknown",
        lastBody: last.body,
        lastAt: last.createdAt,
        waiting: last.from === "user",
        messages,
      };
    })
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return (
    <>
      <LiveRefresh ms={2500} />
      <DepositInbox threads={threads} selectedId={selectedId ?? null} shortcuts={store.chatShortcuts} />
    </>
  );
}
