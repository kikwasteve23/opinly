import { describe, expect, it } from "vitest";
import {
  canWithdrawByReferrals,
  BRONZE_REFERRALS,
  levelName,
  qualifiedReferralCount,
  referralLevel,
  starterSurveysLocked,
  studyEarningsUsd,
  studyVisibleOnDashboard,
} from "../lib/referrals";
import { BEGINNER_STUDIES } from "../lib/beginner-catalog";
import { DEFAULT_STUDIES } from "../lib/studies-data";
import type { Study, Submission, User } from "../lib/types";

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

  it("locks beginner surveys at $400 pending plus approved study pay", () => {
    expect(starterSurveysLocked(400, 1)).toBe(true);
    expect(starterSurveysLocked(399, 1)).toBe(false);
    expect(starterSurveysLocked(400, 2)).toBe(false);
  });

  it("counts pending review and approved study pay, not wallet deposits", () => {
    const submissions: Submission[] = [
      { ...done("usr_a", "news-trust"), status: "approved" },
      { ...done("usr_a", "other"), status: "pending_review", id: "sub_pending" },
    ];
    expect(studyEarningsUsd(studies, submissions, "usr_a")).toBe(400);
  });

  it("hides higher-tier studies until the $400 cap", () => {
    expect(studyVisibleOnDashboard(10, 2, false)).toBe(false);
    expect(studyVisibleOnDashboard(10, 1, false)).toBe(true);
    expect(studyVisibleOnDashboard(400, 2, false)).toBe(true);
  });

  it("offers enough Beginner pay to reach $400", () => {
    const beginnerPay = BEGINNER_STUDIES.reduce((sum, study) => sum + study.reward, 0);
    const catalogPay = DEFAULT_STUDIES.filter((study) => study.tier === 1).reduce((sum, study) => sum + study.reward, 0);
    expect(beginnerPay).toBeGreaterThanOrEqual(400);
    expect(catalogPay).toBeGreaterThanOrEqual(400);
    expect(DEFAULT_STUDIES.every((study) => study.questions.length >= 3)).toBe(true);
  });
});
