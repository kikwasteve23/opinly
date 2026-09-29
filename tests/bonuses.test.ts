import { describe, expect, it } from "vitest";
import { grantReferralJoinBonus, grantSignupBonus, REFERRAL_JOIN_BONUS, SIGNUP_BONUS } from "../lib/bonuses";
import { buildDepositDecisionNotice } from "../lib/deposit-notices";
import { nextLevelProgress } from "../lib/referrals";
import type { StoreData, User } from "../lib/types";

function emptyStore(users: User[]): StoreData {
  return {
    users,
    submissions: [],
    withdrawals: [],
    studies: [],
    ledger: [],
    marketerJobs: [],
    chat: [],
    deposits: [],
    chatShortcuts: [],
    notices: [],
  };
}

function person(id: string, extra: Partial<User> = {}): User {
  return {
    id,
    email: `${id}@opinly.local`,
    passwordHash: "x",
    role: "participant",
    accountStatus: "active",
    referralCode: id,
    referredBy: extra.referredBy ?? null,
    createdAt: "",
    profile: null,
    englishPassed: true,
    englishWriting: "",
    identityStatus: "approved",
    identityNote: "",
    onboardingStep: "complete",
    available: extra.available ?? 0,
    pending: 0,
    withdrawn: 0,
    payout: { network: "usdt_trc20", address: "", addressChangedAt: null },
    lastWithdrawalAt: null,
    walletActivated: false,
    detectedCountry: "US",
    photoUrl: null,
    identityImageUrl: null,
    dismissedMilestones: [],
    recoveryCodeHashes: [],
    deviceIds: [],
    welcomeBonusAt: extra.welcomeBonusAt ?? null,
    shareInvitePending: extra.shareInvitePending ?? false,
    ...extra,
  };
}

describe("signup and referral bonuses", () => {
  it("credits $20 once when someone joins", () => {
    const data = emptyStore([person("usr_a")]);
    expect(grantSignupBonus(data, "usr_a")).toBe(true);
    expect(data.users[0]?.available).toBe(SIGNUP_BONUS);
    expect(grantSignupBonus(data, "usr_a")).toBe(false);
    expect(data.users[0]?.available).toBe(SIGNUP_BONUS);
  });

  it("credits the sponsor $3 when a referred person joins", () => {
    const sponsor = person("usr_a", { available: 10 });
    const newbie = person("usr_b", { referredBy: "usr_a" });
    const data = emptyStore([sponsor, newbie]);
    expect(grantReferralJoinBonus(data, "usr_b")).toBe(true);
    expect(data.users[0]?.available).toBe(10 + REFERRAL_JOIN_BONUS);
    expect(grantReferralJoinBonus(data, "usr_b")).toBe(false);
  });
});

describe("level progress copy", () => {
  it("shows only the referral count on Beginner", () => {
    expect(nextLevelProgress(3, 1).detail).toBe("3 referrals · Beginner");
    expect(nextLevelProgress(1, 1).detail).toBe("1 referral · Beginner");
  });

  it("compares current referrals to the next level, not a level already reached", () => {
    expect(nextLevelProgress(24, 2).detail).toBe("24/50 toward Gold");
    expect(nextLevelProgress(5, 2).detail).toBe("5/20 toward Bronze");
    expect(nextLevelProgress(50, 3).detail).toBe("50/100 toward Platinum");
    expect(nextLevelProgress(120, 4).detail).toBe("120 referrals · Platinum");
  });
});

describe("deposit decision notices", () => {
  it("includes a reason and next steps on reject", () => {
    const notice = buildDepositDecisionNotice(
      { amount: 30, purpose: "activation", marketerId: null, quantity: null, methodLabel: "M-Pesa" },
      "reject",
      "Amount too low",
    );
    expect(notice.tone).toBe("warn");
    expect(notice.body).toMatch(/Amount too low/);
    expect(notice.nextSteps.toLowerCase()).toMatch(/deposit chat/);
  });

  it("tells the client the hire is starting after an approved marketer payment", () => {
    const notice = buildDepositDecisionNotice(
      { amount: 100, purpose: "marketer", marketerId: "mkt_amina", quantity: 20, methodLabel: "M-Pesa" },
      "approve",
      null,
    );
    expect(notice.tone).toBe("ok");
    expect(notice.nextSteps.toLowerCase()).toMatch(/marketer/);
  });
});
