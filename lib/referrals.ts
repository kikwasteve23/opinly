import type { StoreData, Submission, User } from "./types";

export const LEVEL_2_REFERRALS = 20;
export const LEVEL_3_REFERRALS = 50;
export const STARTER_EARNINGS_CAP = 400;

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
  if (qualified >= LEVEL_3_REFERRALS) return 3;
  if (qualified >= LEVEL_2_REFERRALS) return 2;
  return 1;
}

export function levelLabel(level: number) {
  if (level >= 3) return "Level 3 · Premium studies";
  if (level >= 2) return "Level 2 · Higher-paying studies";
  return "Level 1 · Starter studies";
}

export function refsNeededForLevel(level: number) {
  if (level <= 1) return 0;
  if (level === 2) return LEVEL_2_REFERRALS;
  return LEVEL_3_REFERRALS;
}

export function canWithdrawByReferrals(users: User[], submissions: Submission[], referrerId: string) {
  return qualifiedReferralCount(users, submissions, referrerId) >= LEVEL_2_REFERRALS;
}

export function starterSurveysLocked(user: User, level: number) {
  return level < 2 && user.available + user.pending >= STARTER_EARNINGS_CAP;
}

export function canAccessStudyTier(user: User, studyTier: number, level: number) {
  if (user.identityStatus !== "approved") return false;
  if (level < studyTier) return false;
  if (studyTier <= 1 && starterSurveysLocked(user, level)) return false;
  return true;
}

export function studyLockReason(user: User, studyTier: number, level: number) {
  if (user.identityStatus !== "approved") return "Identity has to be approved first.";
  if (level < studyTier) {
    return `This is a level ${studyTier} study. You need ${refsNeededForLevel(studyTier)} active referrals to unlock it.`;
  }
  if (studyTier <= 1 && starterSurveysLocked(user, level)) {
    return `Starter surveys pause at $${STARTER_EARNINGS_CAP}. Bring ${LEVEL_2_REFERRALS} active referrals to open higher-paying work.`;
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
