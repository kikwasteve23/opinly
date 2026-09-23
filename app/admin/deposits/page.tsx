import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { reviewDepositAction } from "@/lib/admin-actions";
import { money } from "@/lib/utils";
import { findMarketer } from "@/lib/marketers";

function purposeLabel(purpose: string, marketerId: string | null, quantity: number | null) {
  if (purpose === "activation") return "Wallet activation";
  const marketer = marketerId ? findMarketer(marketerId) : null;
  return `Hire ${marketer?.name ?? "marketer"}${quantity ? ` × ${quantity}` : ""}`;
}

export default async function AdminDepositsPage() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const byId = Object.fromEntries(store.users.map((u) => [u.id, u]));
  const pending = store.deposits.filter((d) => d.status === "pending");
  const history = store.deposits.filter((d) => d.status !== "pending");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Deposits</h1>
      <p className="mt-1 mb-6 text-sm text-gray-600">
        Only people who tapped “I have sent the payment” for wallet activation or a marketer hire. Study pay does not
        belong here.
      </p>

      <h2 className="font-semibold">Waiting for a match</h2>
      <p className="mt-1 text-sm text-gray-500">Activation deposits and marketer hires until you approve or reject them.</p>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-amber-200 bg-white dark:border-amber-900 dark:bg-gray-900">
        {pending.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">
            Nobody has submitted a payment-method deposit. When someone pays to activate a wallet or hire a marketer,
            they appear here.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-amber-100 bg-amber-50 text-xs uppercase tracking-wide text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Person</th>
                <th className="px-4 py-3 font-semibold">Payment method</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">What they paid for</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((item) => {
                const person = byId[item.userId];
                return (
                  <tr key={item.id} className="border-t border-gray-100 align-top dark:border-gray-800">
                    <td className="px-4 py-4">
                      <Link href={`/admin/people/${item.userId}`} className="font-semibold text-indigo-700">
                        {person?.profile?.legalName || person?.email || item.userId}
                      </Link>
                      <p className="text-xs text-gray-500">{person?.email}</p>
                      <p className="text-xs text-gray-400">
                        {person?.profile?.country || person?.detectedCountry || "Unknown location"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{item.methodLabel}</p>
                      <p className="text-xs text-gray-500">{item.method}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold">{money(item.amount)}</td>
                    <td className="px-4 py-4">{purposeLabel(item.purpose, item.marketerId, item.quantity)}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <form action={reviewDepositAction}>
                          <input type="hidden" name="depositId" value={item.id} />
                          <input type="hidden" name="decision" value="approve" />
                          <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                            Approve
                          </button>
                        </form>
                        <form action={reviewDepositAction} className="flex flex-wrap gap-2">
                          <input type="hidden" name="depositId" value={item.id} />
                          <input type="hidden" name="decision" value="reject" />
                          <input name="note" placeholder="Reason" className="min-w-[8rem] flex-1 rounded-lg border px-3 py-2 text-sm" />
                          <button className="rounded-lg border px-3 py-2 text-sm font-semibold">Reject</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mt-10 font-semibold">Reviewed activation and marketer payments</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {history.length === 0 ? (
          <li className="text-gray-500">No activation or marketer payments have been reviewed yet.</li>
        ) : null}
        {history.map((item) => {
          const person = byId[item.userId];
          return (
            <li key={item.id} className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
              <span className="capitalize">{item.status}</span> · {person?.profile?.legalName || person?.email || item.userId} ·{" "}
              {money(item.amount)} · {item.methodLabel} · {purposeLabel(item.purpose, item.marketerId, item.quantity)}
              {item.adminNote ? ` · ${item.adminNote}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
