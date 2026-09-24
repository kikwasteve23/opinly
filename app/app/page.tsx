import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { readStoreSnapshot } from "@/lib/store";
import { money } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  BRONZE_REFERRALS,
  canAccessStudyTier,
  countsFromStore,
  hitWalletCap,
  levelName,
  starterSurveysLocked,
  studyLockReason,
  studyVisibleOnDashboard,
} from "@/lib/referrals";
import { resolveCountry } from "@/lib/resolve-geo";
import { formatMoney } from "@/lib/geo";
import { isFinishedStudy, latestUserSubmission } from "@/lib/studies-data";
import { StudyCard } from "@/components/study-card";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const store = await readStoreSnapshot();
  const submissions = store.submissions.filter((s) => s.userId === user.id);
  const { qualified, level } = countsFromStore(store, user.id);
  const country = await resolveCountry(user);
  const starterLocked = starterSurveysLocked(user, level);
  const showReferralTrack = hitWalletCap(user);

  const openStudies = store.studies
    .filter((study) => study.published)
    .filter((study) => {
      const mine = latestUserSubmission(submissions, study.id);
      if (isFinishedStudy(mine?.status)) return false;
      return studyVisibleOnDashboard(user, study.tier, Boolean(mine));
    });

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-800 p-5 text-white">
          <p className="text-sm text-indigo-100">Wallet balance</p>
          <p className="mt-1 text-3xl font-bold">{money(user.available)}</p>
          <p className="mt-1 text-xs text-indigo-100">{formatMoney(user.available, country)} in {country.currency}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Pending review</p>
          <p className="mt-1 text-3xl font-bold">{money(user.pending)}</p>
          <p className="mt-1 text-xs text-gray-500">We are reviewing your responses.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Your level</p>
          <p className="mt-1 text-3xl font-bold">{levelName(level)}</p>
          <p className="mt-1 text-xs text-gray-500">
            {showReferralTrack
              ? `${qualified} active referrals · ${BRONZE_REFERRALS} unlocks Bronze`
              : "Beginner studies are open."}
          </p>
        </div>
      </div>

      {!user.photoUrl ? (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
          Add a profile picture from{" "}
          <Link className="font-semibold underline" href="/app/profile">
            Profile
          </Link>
          . A government ID is optional and can wait.
        </div>
      ) : user.identityStatus === "not_started" ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          ID is optional. Add it later from{" "}
          <Link className="font-semibold underline" href="/app/profile">
            Profile
          </Link>{" "}
          if you want extra account protection.
        </div>
      ) : null}

      {starterLocked ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          You have run out of Beginner surveys. Upgrade to the next level to unlock higher-paying surveys. Share your{" "}
          <Link className="font-semibold underline" href="/app/referrals">
            referral link
          </Link>{" "}
          or{" "}
          <Link className="font-semibold underline" href="/app/marketers">
            hire a marketer
          </Link>{" "}
          until you have {BRONZE_REFERRALS} active referrals.
        </div>
      ) : null}

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Studies for you</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {showReferralTrack ? `${levelName(level)} is your current track.` : "Beginner studies are open."} Location{" "}
            {country.name} · pay shown in USD and {country.currency}. Finished work is in{" "}
            <Link href="/app/history" className="font-semibold text-indigo-700">
              History
            </Link>
            .
          </p>
        </div>
        <Link href="/app/history" className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
          History
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {openStudies.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            No open studies right now. Anything you have already submitted lives in History.
          </p>
        ) : null}
        {openStudies.map((study) => {
          const mine = latestUserSubmission(submissions, study.id);
          const status = mine?.status ?? "available";
          const open = canAccessStudyTier(user, study.tier, level);
          const reason = open ? null : studyLockReason(user, study.tier, level);
          return (
            <StudyCard
              key={study.id}
              study={study}
              status={status}
              localPay={formatMoney(study.reward, country)}
              reason={reason}
              rejectionReason={mine?.rejectionReason}
            />
          );
        })}
      </div>
    </div>
  );
}
