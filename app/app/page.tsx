import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { readStoreSnapshot } from "@/lib/store";
import { money } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  BRONZE_REFERRALS,
  canAccessStudyTier,
  countsFromStore,
  dashboardTrack,
  hitWalletCap,
  levelName,
  needsBronzeReferrals,
  studyLockReason,
  studyVisibleOnDashboard,
} from "@/lib/referrals";
import { resolveCountry } from "@/lib/resolve-geo";
import { formatMoney } from "@/lib/geo";
import { isFinishedStudy, latestUserSubmission } from "@/lib/studies-data";
import { StudyList } from "@/components/study-list";
import { BronzeTrackBanner } from "@/components/bronze-track-banner";
import { referralInviteUrl } from "@/lib/app-url";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const store = await readStoreSnapshot();
  const submissions = store.submissions.filter((s) => s.userId === user.id);
  const { qualified, level } = countsFromStore(store, user.id);
  const track = dashboardTrack(user, level);
  const country = await resolveCountry(user);
  const showReferralTrack = hitWalletCap(user);
  const inviteLink = await referralInviteUrl(user.referralCode);

  const openStudies = store.studies
    .filter((study) => study.published)
    .filter((study) => {
      const mine = latestUserSubmission(submissions, study.id);
      if (isFinishedStudy(mine?.status)) return false;
      return studyVisibleOnDashboard(user, study.tier, Boolean(mine), track);
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
          <p className="mt-1 text-3xl font-bold">{levelName(track)}</p>
          <p className="mt-1 text-xs text-gray-500">
            {showReferralTrack
              ? `${qualified} active referrals · ${BRONZE_REFERRALS} unlocks Bronze surveys`
              : "Beginner studies are open."}
          </p>
        </div>
      </div>

      {needsBronzeReferrals(user, qualified) ? (
        <BronzeTrackBanner inviteLink={inviteLink} qualified={qualified} />
      ) : null}

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Studies for you</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {levelName(track)} studies only — locked ones still show so you can see what unlocks next. Location{" "}
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

      <div className="mt-6">
        <StudyList
          items={openStudies.map((study) => {
            const mine = latestUserSubmission(submissions, study.id);
            const status = mine?.status ?? "available";
            const open = canAccessStudyTier(user, study.tier, level);
            return {
              study: {
                id: study.id,
                title: study.title,
                summary: study.summary,
                kind: study.kind,
                tier: study.tier,
                reward: study.reward,
                minutes: study.minutes,
                format: study.format,
                questions: study.questions,
              },
              status,
              localPay: formatMoney(study.reward, country),
              reason: open ? null : studyLockReason(user, study.tier, level),
              rejectionReason: mine?.rejectionReason,
            };
          })}
        />
      </div>
    </div>
  );
}
