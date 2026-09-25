import { describe, expect, it } from "vitest";
import { addQualifiedReferrals, attachExistingReferral, unlinkReferral } from "../lib/admin-referrals";
import { qualifiedReferralCount } from "../lib/referrals";
import type { StoreData, Study, User } from "../lib/types";

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
    photoUrl: null,
    identityImageUrl: null,
    dismissedMilestones: [],
    ...partial,
    recoveryCodeHashes: partial.recoveryCodeHashes ?? [],
    deviceIds: partial.deviceIds ?? [],
  };
}

const study: Study = {
  id: "news-trust",
  title: "T",
  summary: "s",
  kind: "short_poll",
  reward: 2,
  minutes: 4,
  format: "Short poll",
  device: "Phone",
  published: true,
  tier: 1,
  questions: [],
};

function empty(users: User[]): StoreData {
  return {
    users,
    submissions: [],
    withdrawals: [],
    studies: [study],
    ledger: [],
    marketerJobs: [],
    chat: [],
    deposits: [],
  };
}

describe("admin referrals", () => {
  it("adds and removes qualified referrals", () => {
    const sponsor = person({ id: "usr_a" });
    const data = empty([sponsor]);
    const added = addQualifiedReferrals(data, "usr_a", 3);
    expect("ok" in added).toBe(true);
    expect(qualifiedReferralCount(data.users, data.submissions, "usr_a")).toBe(3);
    const recruit = data.users.find((u) => u.referredBy === "usr_a");
    expect(recruit).toBeTruthy();
    unlinkReferral(data, "usr_a", recruit!.id);
    expect(qualifiedReferralCount(data.users, data.submissions, "usr_a")).toBe(2);
  });

  it("links an existing participant by email", () => {
    const sponsor = person({ id: "usr_a" });
    const other = person({ id: "usr_b", email: "other@opinly.local" });
    const data = empty([sponsor, other]);
    data.submissions.push({
      id: "sub_b",
      userId: "usr_b",
      studyId: "news-trust",
      status: "approved",
      answers: {},
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      rejectionReason: null,
      autoApproveAt: null,
    });
    attachExistingReferral(data, "usr_a", "other@opinly.local");
    expect(other.referredBy).toBe("usr_a");
    expect(qualifiedReferralCount(data.users, data.submissions, "usr_a")).toBe(1);
  });
});
