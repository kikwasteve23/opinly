import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { countsFromStore, LEVEL_2_REFERRALS } from "@/lib/referrals";
import { waitingDepositThreadCount } from "@/lib/deposit-chat";
import { money } from "@/lib/utils";

export default async function AdminHome() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const people = store.users.filter((u) => u.role === "participant");
  const pendingId = people.filter((u) => u.identityStatus === "pending").length;
  const pendingStudies = store.submissions.filter((s) => s.status === "pending_review").length;
  const pendingPayouts = store.withdrawals.filter((w) => w.status === "processing");
  const liveSurveys = store.studies.filter((s) => s.published).length;
  const available = people.reduce((sum, u) => sum + u.available, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Operations</h1>
      <p className="mt-1 text-sm text-gray-600">
        Create surveys, review applicants, credit wallets, and send withdrawals. Payouts still need {LEVEL_2_REFERRALS} active
        referrals.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Applicants waiting" value={String(pendingId)} href="/admin/applicants" />
        <Card label="People" value={String(people.length)} href="/admin/people" />
        <Card label="Live surveys" value={String(liveSurveys)} href="/admin/surveys" />
        <Card label="Deposits waiting" value={String(store.deposits.filter((d) => d.status === "pending").length)} href="/admin/deposits" />
        <Card label="Deposit chats waiting" value={String(waitingDepositThreadCount(store.chat))} href="/admin/support" />
        <Card label="Payouts in queue" value={String(pendingPayouts.length)} href="/admin/withdrawals" />
        <Card label="Studies to review" value={String(pendingStudies)} href="/admin/reviews" />
      </div>
      <p className="mt-6 text-sm text-gray-500">Participant available balances total {money(available)}.</p>
      <div className="mt-10">
        <h2 className="font-semibold">Needs attention</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {people
            .filter((u) => u.identityStatus === "pending")
            .slice(0, 8)
            .map((u) => (
              <li key={u.id}>
                <Link className="text-indigo-700" href={`/admin/people/${u.id}`}>
                  {u.profile?.legalName || u.email}
                </Link>{" "}
                · identity pending · {countsFromStore(store, u.id).qualified}/{LEVEL_2_REFERRALS} referrals
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
