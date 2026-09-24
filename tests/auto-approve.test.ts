import { describe, expect, it } from "vitest";
import { processAutoApprovals, textAnswersPass } from "../lib/progression";
import type { StoreData, Study } from "../lib/types";

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
  questions: [{ id: "q1", type: "text", prompt: "Why?", required: true }],
};

function empty(): StoreData {
  return { users: [], submissions: [], withdrawals: [], studies: [study], ledger: [], marketerJobs: [], chat: [], deposits: [] };
}

describe("auto-approve", () => {
  it("requires a few characters in typed answers", () => {
    expect(textAnswersPass(study, { q1: "short" })).toBe(false);
    expect(textAnswersPass(study, { q1: "long enough" })).toBe(true);
  });

  it("pays the user when the delay has passed and text is long enough", () => {
    const data = empty();
    data.users.push({
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
      pending: 5,
      withdrawn: 0,
      payout: { network: "usdt_trc20", address: "", addressChangedAt: null },
      lastWithdrawalAt: null,
      walletActivated: false,
      detectedCountry: "US",
      photoUrl: null,
      identityImageUrl: null,
    });
    data.submissions.push({
      id: "sub1",
      userId: "u1",
      studyId: "s1",
      status: "pending_review",
      answers: { q1: "I wrote a real sentence here." },
      startedAt: "",
      updatedAt: "",
      submittedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      reviewedAt: null,
      rejectionReason: null,
      autoApproveAt: new Date(Date.now() - 1000).toISOString(),
    });
    processAutoApprovals(data, Date.now());
    expect(data.submissions[0]?.status).toBe("approved");
    expect(data.users[0]?.available).toBe(5);
    expect(data.users[0]?.pending).toBe(0);
  });
});
