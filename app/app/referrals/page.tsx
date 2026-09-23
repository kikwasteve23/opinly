import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { countsFromStore, hasFinishedSurvey, LEVEL_2_REFERRALS, LEVEL_3_REFERRALS, shareReferralMessage } from "@/lib/referrals";
import { ShareInvite } from "@/components/share-invite";

export default async function ReferralsPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const { qualified, level } = countsFromStore(store, user.id);
  const invites = store.users.filter((u) => u.referredBy === user.id);
  const appUrl = process.env.APP_URL ?? "";
  const path = `/register?ref=${user.referralCode}`;
  const link = appUrl.startsWith("http") ? `${appUrl}${path}` : path;
  const message = shareReferralMessage(user.available, link.startsWith("http") ? link : `https://opinly.example${path}`);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Referrals</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        A person on your link becomes active when their account is approved and they finish at least one survey. Level 2
        needs {LEVEL_2_REFERRALS} active referrals (higher-paying studies and the path to $500). Level 3 needs{" "}
        {LEVEL_3_REFERRALS} for premium studies.
      </p>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500">You are on level {level}</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-wide">{user.referralCode}</p>
        <p className="mt-4 text-sm text-gray-500">Invite link</p>
        <p className="mt-1 break-all text-sm font-medium">{link}</p>
        <p className="mt-6 text-lg font-semibold">
          {qualified} active · {LEVEL_2_REFERRALS} for level 2 · {LEVEL_3_REFERRALS} for level 3
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (qualified / LEVEL_3_REFERRALS) * 100)}%` }} />
        </div>
        <ShareInvite message={message} />
      </div>
      <ul className="mt-8 space-y-2 text-sm">
        {invites.length === 0 ? <li className="text-gray-500">Nobody has used your code yet.</li> : null}
        {invites.map((invite) => {
          const active = invite.identityStatus === "approved" && hasFinishedSurvey(store.submissions, invite.id);
          return (
            <li key={invite.id} className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
              {invite.email} · {invite.identityStatus.replace("_", " ")} · {active ? "active" : "not yet active"}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
