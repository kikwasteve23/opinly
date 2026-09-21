import { describe, expect, it } from "vitest";
import { canWithdrawByReferrals, qualifiedReferralCount, REFERRAL_REQUIREMENT } from "../lib/referrals";
import type { User } from "../lib/types";

function person(partial: Partial<User> & Pick<User, "id">): User {
  return {
    email: `${partial.id}@opinly.local`,
    passwordHash: "x",
    role: "participant",
    accountStatus: "active",
    referralCode: partial.id,
    referredBy: null,
    createdAt: new Date().toISOString(),
    profile: null,
    englishPassed: true,
    englishWriting: "",
    identityStatus: "approved",
    identityNote: "",
    onboardingStep: "complete",
    available: 0,
    pending: 0,
    withdrawn: 0,
    payout: { network: "usdt_trc20", address: "", addressChangedAt: null },
    lastWithdrawalAt: null,
    ...partial,
  };
}

describe("referrals", () => {
  it("requires 15 identity-approved invitees", () => {
    const sponsor = person({ id: "usr_a" });
    const users = [sponsor];
    for (let i = 0; i < 14; i += 1) {
      users.push(person({ id: `usr_${i}`, referredBy: "usr_a" }));
    }
    expect(qualifiedReferralCount(users, "usr_a")).toBe(14);
    expect(canWithdrawByReferrals(users, "usr_a")).toBe(false);
    users.push(person({ id: "usr_15", referredBy: "usr_a" }));
    expect(REFERRAL_REQUIREMENT).toBe(15);
    expect(canWithdrawByReferrals(users, "usr_a")).toBe(true);
  });

  it("does not count unverified or suspended invitees", () => {
    const users = [
      person({ id: "usr_a" }),
      person({ id: "usr_b", referredBy: "usr_a", identityStatus: "pending" }),
      person({ id: "usr_c", referredBy: "usr_a", accountStatus: "suspended" }),
    ];
    expect(qualifiedReferralCount(users, "usr_a")).toBe(0);
  });
});
