import { describe, expect, it } from "vitest";
import { marketerQuote, PAY_AFTER_SURCHARGE } from "../lib/marketers";
import { visibleMilestone } from "../lib/milestones";
import { ATTENTION_RETRY } from "../lib/money";
import { submitStudyInStore } from "../lib/submit-study";
import type { StoreData, Study, User } from "../lib/types";

function user(partial: Partial<User> = {}): User {
  return {
    id: "u1",
    email: "a@b.c",
    passwordHash: "x",
    role: "participant",
    accountStatus: "active",
    referralCode: "A",
    referredBy: null,
    createdAt: "",
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

describe("marketer quotes", () => {
  it("adds 10% only on pay-after", () => {
    expect(PAY_AFTER_SURCHARGE).toBe(0.1);
    expect(marketerQuote(5, 4, "prepaid").amount).toBe(20);
    expect(marketerQuote(5, 4, "postpaid").amount).toBe(22);
  });
});

describe("milestones", () => {
  it("congratulates the $400 cap with a hire next step", () => {
    const card = visibleMilestone({
      user: user({ available: 400, pending: 0 }),
      qualified: 0,
      approvedStudies: 2,
    });
    expect(card?.id).toBe("cap400");
    expect(card?.nextHref).toBe("/app/marketers");
    expect(card?.body.toLowerCase()).toContain("pay after");
  });

  it("only offers activation after $500", () => {
    const early = visibleMilestone({
      user: user({ available: 120, pending: 0 }),
      qualified: 0,
      approvedStudies: 0,
    });
    expect(early).toBeNull();
    const ready = visibleMilestone({
      user: user({ available: 500, pending: 0, walletActivated: false }),
      qualified: 20,
      approvedStudies: 3,
    });
    expect(ready?.id).toBe("cash500");
    expect(ready?.nextHref).toBe("/app/deposit");
  });

  it("hides a card after it is dismissed", () => {
    const card = visibleMilestone({
      user: user({ available: 400, dismissedMilestones: ["cap400", "first_study"] }),
      qualified: 0,
      approvedStudies: 1,
    });
    expect(card).toBeNull();
  });
});

describe("attention checks", () => {
  it("asks the person to refresh instead of rejecting the study", () => {
    const study: Study = {
      id: "s1",
      title: "T",
      summary: "s",
      kind: "survey",
      reward: 5,
      minutes: 5,
      format: "Survey",
      device: "Phone",
      published: true,
      tier: 1,
      questions: [
        { id: "q1", type: "attention", prompt: "Pick yes", options: ["No", "Yes"], correct: "Yes", required: true },
      ],
    };
    const data: StoreData = {
      users: [user()],
      submissions: [
        {
          id: "sub1",
          userId: "u1",
          studyId: "s1",
          status: "in_progress",
          answers: { q1: "No" },
          startedAt: "",
          updatedAt: "",
          submittedAt: null,
          reviewedAt: null,
          rejectionReason: null,
          autoApproveAt: null,
        },
      ],
      withdrawals: [],
      studies: [study],
      ledger: [],
      marketerJobs: [],
      chat: [],
      deposits: [],
    };
    const result = submitStudyInStore(data, "u1", "s1");
    expect(result).toEqual({ error: ATTENTION_RETRY });
    expect(data.submissions[0]?.status).toBe("in_progress");
    expect(data.submissions[0]?.answers).toEqual({});
  });
});
