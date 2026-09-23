import { makeReferralCode } from "./ids";
import type { User } from "./types";

export { newId, makeReferralCode } from "./ids";

export function normalizeUser(raw: Partial<User> & Pick<User, "id" | "email" | "passwordHash">): User {
  const { referralCode, referredBy, walletActivated, detectedCountry, ...rest } = raw;
  return {
    role: "participant",
    accountStatus: "active",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    profile: raw.profile ?? null,
    englishPassed: raw.englishPassed ?? false,
    englishWriting: raw.englishWriting ?? "",
    identityStatus: raw.identityStatus ?? "not_started",
    identityNote: raw.identityNote ?? "",
    onboardingStep: raw.onboardingStep ?? "profile",
    available: raw.available ?? 0,
    pending: raw.pending ?? 0,
    withdrawn: raw.withdrawn ?? 0,
    payout: raw.payout ?? { network: "usdt_trc20", address: "", addressChangedAt: null },
    lastWithdrawalAt: raw.lastWithdrawalAt ?? null,
    ...rest,
    referredBy: referredBy ?? null,
    referralCode: referralCode || makeReferralCode(),
    walletActivated: walletActivated ?? false,
    detectedCountry: detectedCountry ?? null,
  };
}
