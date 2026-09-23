import { describe, expect, it } from "vitest";
import { canWithdrawByReferrals, LEVEL_2_REFERRALS, qualifiedReferralCount, referralLevel, starterSurveysLocked } from "../lib/referrals";
import type { Submission, User } from "../lib/types";

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
    walletActivated: false,
    detectedCountry: "US",
    ...partial,
  };
}

function done(userId: string): Submission {
  return {
    id: `sub_${userId}`,
    userId,
    studyId: "news-trust",
    status: "approved",
    answers: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    rejectionReason: null,
    autoApproveAt: null,
  };
}

describe("referrals", () => {
  it("counts only approved invitees who finished a survey", () => {
    const sponsor = person({ id: "usr_a" });
    const users = [sponsor];
    const submissions: Submission[] = [];
    for (let i = 0; i < 20; i += 1) {
      users.push(person({ id: `usr_${i}`, referredBy: "usr_a" }));
      if (i < 19) submissions.push(done(`usr_${i}`));
    }
    expect(qualifiedReferralCount(users, submissions, "usr_a")).toBe(19);
    expect(canWithdrawByReferrals(users, submissions, "usr_a")).toBe(false);
    submissions.push(done("usr_19"));
    expect(LEVEL_2_REFERRALS).toBe(20);
    expect(canWithdrawByReferrals(users, submissions, "usr_a")).toBe(true);
    expect(referralLevel(20)).toBe(2);
  });

  it("does not count unverified invitees even with a survey", () => {
    const users = [
      person({ id: "usr_a" }),
      person({ id: "usr_b", referredBy: "usr_a", identityStatus: "pending" }),
      person({ id: "usr_c", referredBy: "usr_a", accountStatus: "suspended" }),
    ];
    const submissions = [done("usr_b"), done("usr_c")];
    expect(qualifiedReferralCount(users, submissions, "usr_a")).toBe(0);
  });

  it("locks starter surveys at $400 on level 1", () => {
    expect(starterSurveysLocked(person({ id: "usr_a", available: 400 }), 1)).toBe(true);
    expect(starterSurveysLocked(person({ id: "usr_a", available: 400 }), 2)).toBe(false);
  });
});
