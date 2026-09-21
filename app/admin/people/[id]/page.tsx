import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { qualifiedReferralCount, REFERRAL_REQUIREMENT } from "@/lib/referrals";
import { money } from "@/lib/utils";
import { adjustWalletAction, setAccountStatusAction, setIdentityAction } from "@/lib/admin-actions";
import { getStudy } from "@/lib/studies-data";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const store = await readStoreSnapshot();
  const person = store.users.find((u) => u.id === id);
  if (!person || person.role !== "participant") notFound();
  const referrals = store.users.filter((u) => u.referredBy === person.id);
  const submissions = store.submissions.filter((s) => s.userId === person.id);
  const withdrawals = store.withdrawals.filter((w) => w.userId === person.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{person.profile?.legalName || person.email}</h1>
        <p className="text-sm text-gray-500">{person.email} · code {person.referralCode}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Available" value={money(person.available)} />
        <Stat label="Pending" value={money(person.pending)} />
        <Stat label="Withdrawn" value={money(person.withdrawn)} />
        <Stat label="Qualified referrals" value={`${qualifiedReferralCount(store.users, person.id)}/${REFERRAL_REQUIREMENT}`} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Identity</h2>
        <p className="mt-1 text-sm text-gray-500">{person.identityNote || "No note yet."}</p>
        <form action={setIdentityAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="userId" value={person.id} />
          <label className="text-sm">
            Status
            <select name="status" defaultValue={person.identityStatus} className="mt-1 block rounded-lg border px-3 py-2">
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
          <label className="flex-1 text-sm">
            Note
            <input name="note" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Reviewer note" />
          </label>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Wallet adjustment</h2>
        <form action={adjustWalletAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="userId" value={person.id} />
          <label className="text-sm">
            Amount (use negative to debit)
            <input name="amount" type="number" step="0.01" required className="mt-1 block rounded-lg border px-3 py-2" />
          </label>
          <label className="flex-1 text-sm">
            Reason
            <input name="reason" required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Apply</button>
        </form>
        <form action={setAccountStatusAction} className="mt-4">
          <input type="hidden" name="userId" value={person.id} />
          <input type="hidden" name="status" value={person.accountStatus === "suspended" ? "active" : "suspended"} />
          <button className="text-sm font-semibold text-red-700">
            {person.accountStatus === "suspended" ? "Reactivate account" : "Suspend account"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Referrals</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {referrals.length === 0 ? <li className="text-gray-500">None yet.</li> : null}
          {referrals.map((ref) => (
            <li key={ref.id}>
              {ref.email} · {ref.identityStatus} · {ref.accountStatus}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Studies</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {submissions.map((s) => (
            <li key={s.id}>
              {getStudy(s.studyId)?.title ?? s.studyId} · {s.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Withdrawals</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {withdrawals.map((w) => (
            <li key={w.id}>
              {money(w.requested)} · {w.status} · {w.network}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
