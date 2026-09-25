import { describe, expect, it } from "vitest";
import { parseDateOfBirth, saveEnglishInStore, saveProfileInStore } from "../lib/onboarding";
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
  };
}

function store(u: User): StoreData {
  return { users: [u], submissions: [], withdrawals: [], studies: [], ledger: [], marketerJobs: [], chat: [], deposits: [] };
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
  });

  it("accepts a slash date of birth", () => {
    expect(parseDateOfBirth("10/10/1995")?.getUTCFullYear()).toBe(1995);
    expect(parseDateOfBirth("1995-10-10")?.getUTCFullYear()).toBe(1995);
  });
});
