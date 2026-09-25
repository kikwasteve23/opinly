import { describe, expect, it } from "vitest";
import {
  canAccessStudyTier,
  canWithdrawByReferrals,
  BRONZE_REFERRALS,
  levelName,
  qualifiedReferralCount,
  referralLevel,
  starterSurveysLocked,
  studyEarningsUsd,
  studyLockReason,
  studyVisibleOnDashboard,
} from "../lib/referrals";
import { BEGINNER_STUDIES } from "../lib/beginner-catalog";
import { DEFAULT_STUDIES } from "../lib/studies-data";
import type { Study, Submission, User, StoreData } from "../lib/types";
import { submitStudyInStore } from "../lib/submit-study";

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

function done(userId: string, studyId = "news-trust"): Submission {
  return {
    id: `sub_${userId}_${studyId}`,
    userId,
    studyId,
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

const studies: Study[] = [
  {
    id: "news-trust",
    title: "T",
    summary: "s",
    kind: "short_poll",
    reward: 200,
    minutes: 4,
    format: "Short poll",
    device: "Phone",
    published: true,
    tier: 1,
    questions: [],
  },
  {
    id: "other",
    title: "T2",
    summary: "s",
    kind: "survey",
    reward: 200,
    minutes: 8,
    format: "Survey",
    device: "Phone",
    published: true,
    tier: 1,
    questions: [],
  },
];

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
    expect(BRONZE_REFERRALS).toBe(20);
    expect(canWithdrawByReferrals(users, submissions, "usr_a")).toBe(true);
    expect(referralLevel(20)).toBe(2);
    expect(levelName(1)).toBe("Beginner");
    expect(levelName(2)).toBe("Bronze");
    expect(levelName(3)).toBe("Gold");
    expect(levelName(4)).toBe("Platinum");
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

  it("locks beginner surveys at a $400 wallet (available plus pending)", () => {
    expect(starterSurveysLocked(person({ id: "usr_a", available: 400, pending: 0 }), 1)).toBe(true);
    expect(starterSurveysLocked(person({ id: "usr_a", available: 350, pending: 50 }), 1)).toBe(true);
    expect(starterSurveysLocked(person({ id: "usr_a", available: 399, pending: 0 }), 1)).toBe(false);
    expect(starterSurveysLocked(person({ id: "usr_a", available: 400, pending: 0 }), 2)).toBe(false);
  });

  it("blocks taking Beginner work when wallet is over $400 even without an ID", () => {
    const overCap = person({
      id: "usr_a",
      available: 409.75,
      pending: 0,
      identityStatus: "not_started",
    });
    expect(canAccessStudyTier(overCap, 1, 1)).toBe(false);
    const early = person({ id: "usr_b", available: 159.75, pending: 0, identityStatus: "not_started" });
    expect(canAccessStudyTier(early, 1, 1)).toBe(true);
    const bronze = person({ id: "usr_c", available: 409.75, pending: 0 });
    expect(canAccessStudyTier(bronze, 1, 2)).toBe(true);
    const reason = studyLockReason(overCap, 1, 1);
    expect(reason).toMatch(/run out of Beginner surveys/i);
    expect(reason).not.toMatch(/400/);
  });

  it("counts pending review and approved study pay", () => {
    const submissions: Submission[] = [
      { ...done("usr_a", "news-trust"), status: "approved" },
      { ...done("usr_a", "other"), status: "pending_review", id: "sub_pending" },
    ];
    expect(studyEarningsUsd(studies, submissions, "usr_a")).toBe(400);
  });

  it("hides higher-tier studies until the wallet hits $400", () => {
    const early = person({ id: "usr_a", available: 10, pending: 0 });
    expect(studyVisibleOnDashboard(early, 2, false)).toBe(false);
    expect(studyVisibleOnDashboard(early, 1, false)).toBe(true);
    const capped = person({ id: "usr_a", available: 409, pending: 0 });
    expect(studyVisibleOnDashboard(capped, 2, false)).toBe(true);
  });

  it("rejects submit when the wallet already sits at the $400 pause", () => {
    const user = person({ id: "usr_a", available: 409.75, pending: 0, identityStatus: "not_started" });
    const data: StoreData = {
      users: [user],
      submissions: [
        {
          ...done("usr_a", "news-trust"),
          status: "in_progress",
          submittedAt: null,
          reviewedAt: null,
        },
      ],
      withdrawals: [],
      studies,
      ledger: [],
      marketerJobs: [],
      chat: [],
      deposits: [],
    };
    const result = submitStudyInStore(data, "usr_a", "news-trust");
    expect("error" in result).toBe(true);
    expect(user.pending).toBe(0);
  });
});
