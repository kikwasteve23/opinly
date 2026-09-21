import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { qualifiedReferralCount, REFERRAL_REQUIREMENT } from "@/lib/referrals";
import { money } from "@/lib/utils";

export default async function AdminHome() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const people = store.users.filter((u) => u.role === "participant");
  const pendingId = people.filter((u) => u.identityStatus === "pending").length;
  const pendingStudies = store.submissions.filter((s) => s.status === "pending_review").length;
  const pendingPayouts = store.withdrawals.filter((w) => w.status === "processing");
  const available = people.reduce((sum, u) => sum + u.available, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Operations</h1>
      <p className="mt-1 text-sm text-gray-600">Review identity, study work, and crypto payouts. Withdrawals need {REFERRAL_REQUIREMENT} verified referrals.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Participants" value={String(people.length)} href="/admin/people" />
        <Card label="ID checks waiting" value={String(pendingId)} href="/admin/people" />
        <Card label="Studies to review" value={String(pendingStudies)} href="/admin/reviews" />
        <Card label="Payouts in queue" value={String(pendingPayouts.length)} href="/admin/wallets" />
      </div>
      <p className="mt-6 text-sm text-gray-500">Participant available balances total {money(available)}.</p>
      <div className="mt-10">
        <h2 className="font-semibold">Needs attention</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {people.filter((u) => u.identityStatus === "pending").slice(0, 8).map((u) => (
            <li key={u.id}>
              <Link className="text-indigo-700" href={`/admin/people/${u.id}`}>
                {u.email}
              </Link>{" "}
              · identity pending · {qualifiedReferralCount(store.users, u.id)}/{REFERRAL_REQUIREMENT} referrals
            </li>
          ))}
          {pendingId === 0 ? <li className="text-gray-500">No identity checks waiting.</li> : null}
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Link>
  );
}
