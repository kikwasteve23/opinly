import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { readStoreSnapshot } from "@/lib/store";
import { kindLabel, questionCountLabel, tierLabel } from "@/lib/studies-data";
import { money } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  BRONZE_REFERRALS,
  canAccessStudyTier,
  countsFromStore,
  hitStudyEarningsCap,
  levelName,
  starterSurveysLocked,
  STARTER_EARNINGS_CAP,
  studyEarningsUsd,
  studyLockReason,
  studyVisibleOnDashboard,
} from "@/lib/referrals";
import { resolveCountry } from "@/lib/resolve-geo";
import { formatMoney } from "@/lib/geo";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const store = await readStoreSnapshot();
  const submissions = store.submissions.filter((s) => s.userId === user.id);
  const { qualified, level } = countsFromStore(store, user.id);
  const earnings = studyEarningsUsd(store.studies, store.submissions, user.id);
  const country = await resolveCountry(user);
  const starterLocked = starterSurveysLocked(earnings, level);
  const showReferralTrack = hitStudyEarningsCap(earnings);

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
        {showReferralTrack ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500">Your level</p>
            <p className="mt-1 text-3xl font-bold">{levelName(level)}</p>
            <p className="mt-1 text-xs text-gray-500">
              {qualified} active referrals · {BRONZE_REFERRALS} unlocks Bronze
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500">Study earnings</p>
            <p className="mt-1 text-3xl font-bold">{money(earnings)}</p>
            <p className="mt-1 text-xs text-gray-500">
              Pending review plus approved, toward {money(STARTER_EARNINGS_CAP)} on Beginner.
            </p>
          </div>
        )}
      </div>

      {user.identityStatus !== "approved" ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Identity is {user.identityStatus.replace("_", " ")}. Studies stay closed until an admin approves your check.
        </div>
      ) : null}

      {starterLocked ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Beginner surveys pause at {money(STARTER_EARNINGS_CAP)} in pending plus approved study pay. Share your{" "}
          <Link className="font-semibold underline" href="/app/referrals">
            referral link
          </Link>{" "}
          or{" "}
          <Link className="font-semibold underline" href="/app/marketers">
            hire a marketer
          </Link>{" "}
          until you have {BRONZE_REFERRALS} active referrals. Higher-paying studies are listed below and stay locked
          until then.
        </div>
      ) : null}

      <div className="mt-10 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Studies for you</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {showReferralTrack ? `${levelName(level)} is your current track.` : "Beginner studies are open."} Location{" "}
            {country.name} · pay shown in USD and {country.currency}.
          </p>
        </div>
        <Link href="/app/wallet" className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
          Wallet
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {store.studies
          .filter((study) => study.published)
          .filter((study) => {
            const mine = submissions.some((s) => s.studyId === study.id);
            return studyVisibleOnDashboard(earnings, study.tier, mine);
          })
          .map((study) => {
            const mine = submissions.filter((s) => s.studyId === study.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] as
              | (typeof submissions)[number]
              | undefined;
            const status = mine?.status ?? "available";
            const done = status === "approved" || status === "pending_review";
            const open = canAccessStudyTier(user, study.tier, level, earnings);
            const reason = open ? null : studyLockReason(user, study.tier, level, earnings);
            return (
              <div key={study.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{study.title}</h2>
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{kindLabel(study.kind)}</span>
                    <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs text-violet-800">{tierLabel(study.tier)}</span>
                    {status !== "available" ? (
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {status.replace("_", " ")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{study.summary}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {questionCountLabel(study.questions.length)} · About {study.minutes} minutes · {study.format} ·{" "}
                    {formatMoney(study.reward, country)}
                  </p>
                  {mine?.rejectionReason ? <p className="mt-2 text-sm text-red-600">{mine.rejectionReason}</p> : null}
                  {reason ? <p className="mt-2 text-sm text-amber-800">{reason}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {money(study.reward)}
                  </span>
                  {done ? (
                    <span className="text-sm text-gray-500">Done</span>
                  ) : !open ? (
                    <span className="text-sm text-gray-500">Locked</span>
                  ) : (
                    <Link href={`/app/studies/${study.id}`} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                      {status === "in_progress" ? "Continue" : status === "rejected" ? "Retake" : "Start study"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
