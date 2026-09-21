import type { User } from "./types";

export const REFERRAL_REQUIREMENT = 15;

export function qualifiedReferralCount(users: User[], referrerId: string) {
  return users.filter(
    (u) =>
      u.referredBy === referrerId &&
      u.role === "participant" &&
      u.accountStatus === "active" &&
      u.identityStatus === "approved",
  ).length;
}

export function canWithdrawByReferrals(users: User[], referrerId: string) {
  return qualifiedReferralCount(users, referrerId) >= REFERRAL_REQUIREMENT;
}
