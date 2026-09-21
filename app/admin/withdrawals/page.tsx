import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { money } from "@/lib/utils";
import { reviewWithdrawalAction } from "@/lib/admin-actions";

export default async function AdminWithdrawals() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const byId = Object.fromEntries(store.users.map((u) => [u.id, u]));
  const queue = store.withdrawals.filter((item) => item.status === "processing");
  const history = store.withdrawals.filter((item) => item.status !== "processing");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Withdrawals</h1>
      <p className="mt-1 text-sm text-gray-600">
        Mark a payout sent after you have transferred crypto, or reject it to refund the available balance.
      </p>
      <WithdrawalList title="In queue" items={queue} byId={byId} empty="No withdrawals waiting." />
      <WithdrawalList title="History" items={history} byId={byId} empty="No completed payouts yet." />
    </div>
  );
}

function WithdrawalList({
  title,
  items,
  byId,
  empty,
}: {
  title: string;
  items: Awaited<ReturnType<typeof readStoreSnapshot>>["withdrawals"];
  byId: Record<string, Awaited<ReturnType<typeof readStoreSnapshot>>["users"][number]>;
  empty: string;
}) {
  return (
    <div className="mt-8">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? <p className="text-sm text-gray-500">{empty}</p> : null}
        {items.map((item) => {
          const person = byId[item.userId];
          return (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/people/${item.userId}`} className="font-semibold text-indigo-700">
                    {person?.profile?.legalName || person?.email || item.userId}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {money(item.requested)} · {item.network === "ltc" ? "Litecoin" : "USDT TRC20"} · arrives {money(item.arrives)}
                  </p>
                  <p className="mt-1 break-all text-xs text-gray-400">{item.address}</p>
                  {item.adminNote ? <p className="mt-2 text-sm text-gray-600">{item.adminNote}</p> : null}
                </div>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs capitalize">{item.status}</span>
              </div>
              {item.status === "processing" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={reviewWithdrawalAction}>
                    <input type="hidden" name="withdrawalId" value={item.id} />
                    <input type="hidden" name="decision" value="sent" />
                    <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Mark sent</button>
                  </form>
                  <form action={reviewWithdrawalAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="withdrawalId" value={item.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <input name="note" placeholder="Reason" className="rounded-lg border px-3 py-2 text-sm" />
                    <button className="rounded-lg border px-3 py-2 text-sm font-semibold">Reject and refund</button>
                  </form>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
