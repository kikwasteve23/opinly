import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { qualifiedReferralCount, REFERRAL_REQUIREMENT } from "@/lib/referrals";

export default async function ReferralsPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const qualified = qualifiedReferralCount(store.users, user.id);
  const invites = store.users.filter((u) => u.referredBy === user.id);
  const appUrl = process.env.APP_URL ?? "";
  const link = `${appUrl || ""}/register?ref=${user.referralCode}`;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Referrals</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        You need {REFERRAL_REQUIREMENT} people who join with your code and pass identity review before you can withdraw. Studies can still be completed in the meantime.
      </p>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Your code</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-wide">{user.referralCode}</p>
        <p className="mt-4 text-sm text-gray-500">Invite link</p>
        <p className="mt-1 break-all text-sm font-medium">{link.startsWith("http") ? link : `/register?ref=${user.referralCode}`}</p>
        <p className="mt-6 text-lg font-semibold">
          {qualified} / {REFERRAL_REQUIREMENT} verified
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (qualified / REFERRAL_REQUIREMENT) * 100)}%` }} />
        </div>
      </div>
      <ul className="mt-8 space-y-2 text-sm">
        {invites.length === 0 ? <li className="text-gray-500">Nobody has used your code yet.</li> : null}
        {invites.map((invite) => (
          <li key={invite.id} className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
            {invite.email} · {invite.identityStatus.replace("_", " ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
