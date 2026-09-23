import type { StoreData, Study, Submission, User } from "./types";

export const BRONZE_REFERRALS = 20;
export const GOLD_REFERRALS = 50;
export const PLATINUM_REFERRALS = 100;
export const STARTER_EARNINGS_CAP = 400;

/** @deprecated use BRONZE_REFERRALS */
export const LEVEL_2_REFERRALS = BRONZE_REFERRALS;
/** @deprecated use GOLD_REFERRALS */
export const LEVEL_3_REFERRALS = GOLD_REFERRALS;

export const TIER_NAMES = {
  1: "Beginner",
  2: "Bronze",
  3: "Gold",
  4: "Platinum",
} as const;

export function hasFinishedSurvey(submissions: Submission[], userId: string) {
  return submissions.some(
    (s) => s.userId === userId && (s.status === "approved" || s.status === "pending_review") && s.submittedAt,
  );
}

/** A referral counts when the person is approved and has completed at least one survey. */
export function qualifiedReferralCount(users: User[], submissions: Submission[], referrerId: string) {
  return users.filter(
    (u) =>
      u.referredBy === referrerId &&
      u.role === "participant" &&
      u.accountStatus === "active" &&
      u.identityStatus === "approved" &&
      hasFinishedSurvey(submissions, u.id),
  ).length;
}

export function referralLevel(qualified: number) {
  if (qualified >= PLATINUM_REFERRALS) return 4;
  if (qualified >= GOLD_REFERRALS) return 3;
  if (qualified >= BRONZE_REFERRALS) return 2;
  return 1;
}

export function levelName(level: number) {
  if (level >= 4) return TIER_NAMES[4];
  if (level >= 3) return TIER_NAMES[3];
  if (level >= 2) return TIER_NAMES[2];
  return TIER_NAMES[1];
}

export function levelLabel(level: number) {
  if (level >= 4) return "Platinum · top-tier studies";
  if (level >= 3) return "Gold · premium studies";
  if (level >= 2) return "Bronze · higher-paying studies";
  return "Beginner · free starter studies";
}

export function refsNeededForLevel(level: number) {
  if (level <= 1) return 0;
  if (level === 2) return BRONZE_REFERRALS;
  if (level === 3) return GOLD_REFERRALS;
  return PLATINUM_REFERRALS;
}

export function canWithdrawByReferrals(users: User[], submissions: Submission[], referrerId: string) {
  return qualifiedReferralCount(users, submissions, referrerId) >= BRONZE_REFERRALS;
}

/** Study pay already in pending review or approved. Deposits do not count. */
export function studyEarningsUsd(studies: Study[], submissions: Submission[], userId: string) {
  const rewards = new Map(studies.map((study) => [study.id, study.reward]));
  let total = 0;
  for (const submission of submissions) {
    if (submission.userId !== userId) continue;
    if (submission.status !== "approved" && submission.status !== "pending_review") continue;
    total += rewards.get(submission.studyId) ?? 0;
  }
  return Math.round(total * 100) / 100;
}

export function hitStudyEarningsCap(earnings: number) {
  return earnings >= STARTER_EARNINGS_CAP;
}

export function starterSurveysLocked(earnings: number, level: number) {
  return level < 2 && hitStudyEarningsCap(earnings);
}

/** Higher-paying studies appear only after $400 in pending + approved study pay. */
export function studyVisibleOnDashboard(earnings: number, studyTier: number, alreadyStarted: boolean) {
  if (alreadyStarted) return true;
  if (studyTier <= 1) return true;
  return hitStudyEarningsCap(earnings);
}

export function canAccessStudyTier(user: User, studyTier: number, level: number, earnings: number) {
  if (user.identityStatus !== "approved") return false;
  if (studyTier > 1 && !hitStudyEarningsCap(earnings)) return false;
  if (level < studyTier) return false;
  if (studyTier <= 1 && starterSurveysLocked(earnings, level)) return false;
  return true;
}

export function studyLockReason(user: User, studyTier: number, level: number, earnings: number) {
  if (user.identityStatus !== "approved") return "Identity has to be approved first.";
  if (studyTier <= 1 && starterSurveysLocked(earnings, level)) {
    return `Beginner surveys pause once pending review plus approved study pay reaches $${STARTER_EARNINGS_CAP}. Bring ${BRONZE_REFERRALS} active referrals to open Bronze work.`;
  }
  if (!hitStudyEarningsCap(earnings) && studyTier > 1) {
    return `Higher-paying studies appear after $${STARTER_EARNINGS_CAP} in pending and approved study pay.`;
  }
  if (level < studyTier) {
    return `This is a ${levelName(studyTier)} study. You need ${refsNeededForLevel(studyTier)} active referrals to unlock it.`;
  }
  return null;
}

export function countsFromStore(data: Pick<StoreData, "users" | "submissions">, referrerId: string) {
  const qualified = qualifiedReferralCount(data.users, data.submissions, referrerId);
  return { qualified, level: referralLevel(qualified) };
}

export function shareReferralMessage(availableUsd: number, link: string) {
  const earned = availableUsd.toFixed(2);
  return `I earned $${earned} on Opinly by doing simple surveys. Join using this link and start earning. ${link}`;
}
