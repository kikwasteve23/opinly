import { describe, expect, it } from "vitest";
import { dismissShareInviteInStore, parseDateOfBirth, saveEnglishInStore, saveProfileInStore } from "../lib/onboarding";
import { normalizeUser } from "../lib/normalize-user";
import type { StoreData, User } from "../lib/types";

function user(partial: Partial<User> = {}): User {
  return {
    id: "u1",
    email: "new@opinly.local",
    passwordHash: "x",
    role: "participant",
    accountStatus: "active",
    referralCode: "NEW1",
    referredBy: null,
    createdAt: "",
    profile: null,
    englishPassed: false,
    englishWriting: "",
    identityStatus: "not_started",
    identityNote: "",
    onboardingStep: "profile",
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
    welcomeBonusAt: partial.welcomeBonusAt ?? null,
    shareInvitePending: partial.shareInvitePending ?? false,
  };
}

function store(u: User): StoreData {
  return { users: [u], submissions: [], withdrawals: [], studies: [], ledger: [], marketerJobs: [], chat: [], deposits: [], chatShortcuts: [], notices: [] };
}

describe("onboarding", () => {
  it("moves About you to English and then completes after a passing score", () => {
    const data = store(user());
    const profile = saveProfileInStore(data, "u1", {
      legalName: "Test User",
      dateOfBirth: "1995-10-10",
      gender: "Man",
      country: "United States",
      city: "Oregon",
      region: "Oregon",
      postalCode: "00227",
      languages: ["English"],
      occupation: "Ceo",
    });
    expect("user" in profile).toBe(true);
    expect(data.users[0]?.onboardingStep).toBe("english");

    const english = saveEnglishInStore(data, "u1", {
      answers: {
        e1: "She doesn't have time today.",
        e2: "better",
        e3: "Decide a person does not qualify for the study",
      },
      writing: "I used a grocery delivery app last week and the driver was on time which made the evening easier.",
    });
    expect("user" in english).toBe(true);
    expect(data.users[0]?.onboardingStep).toBe("complete");
    expect(data.users[0]?.englishPassed).toBe(true);
    expect(data.users[0]?.shareInvitePending).toBe(true);
    dismissShareInviteInStore(data, "u1");
    expect(data.users[0]?.shareInvitePending).toBe(false);
  });

  it("does not offer the share invite after a failed English attempt", () => {
    const data = store(user({ onboardingStep: "english" }));
    const english = saveEnglishInStore(data, "u1", {
      answers: { e1: "wrong", e2: "wrong", e3: "wrong" },
      writing: "I used a grocery delivery app last week and the driver was on time which made the evening easier.",
    });
    expect("error" in english).toBe(true);
    expect(data.users[0]?.shareInvitePending).toBe(false);
    expect(data.users[0]?.englishPassed).toBe(false);
  });

  it("does not show the share invite to people who already finished onboarding", () => {
    const existing = normalizeUser({
      id: "old",
      email: "old@opinly.local",
      passwordHash: "x",
      englishPassed: true,
      onboardingStep: "complete",
    });
    expect(existing.shareInvitePending).toBe(false);
  });

  it("accepts a slash date of birth", () => {
    expect(parseDateOfBirth("10/10/1995")?.getUTCFullYear()).toBe(1995);
    expect(parseDateOfBirth("1995-10-10")?.getUTCFullYear()).toBe(1995);
  });
});
