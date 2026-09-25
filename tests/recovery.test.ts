import { describe, expect, it } from "vitest";
import { accountsOnDevice, DEVICE_LIMIT_MESSAGE, MAX_ACCOUNTS_PER_DEVICE } from "../lib/device";
import { formatRecoveryCode, generateRecoveryCodes, hashRecoveryCode, matchRecoveryCode, normalizeRecoveryCode } from "../lib/recovery";

describe("recovery codes", () => {
  it("hashes and matches formatted codes once", () => {
    const { codes, hashes } = generateRecoveryCodes(8);
    expect(codes).toHaveLength(8);
    expect(new Set(codes).size).toBe(8);
    const first = codes[0]!;
    expect(formatRecoveryCode(normalizeRecoveryCode(first))).toBe(first);
    expect(matchRecoveryCode(hashes, first.toLowerCase())).toBe(0);
    expect(matchRecoveryCode(hashes, "nope-nope")).toBe(-1);
    expect(hashRecoveryCode(first)).toBe(hashes[0]);
  });

  it("treats a used hash as spent", () => {
    const { codes, hashes } = generateRecoveryCodes(3);
    const remaining = [...hashes];
    const index = matchRecoveryCode(remaining, codes[1]!);
    remaining.splice(index, 1);
    expect(matchRecoveryCode(remaining, codes[1]!)).toBe(-1);
    expect(matchRecoveryCode(remaining, codes[0]!)).toBeGreaterThanOrEqual(0);
  });
});

describe("device registration cap", () => {
  it("blocks a fourth account on the same device ids", () => {
    const device = "device-aaa";
    const users = [1, 2, 3].map((n) => ({ role: "participant" as const, deviceIds: [device], id: String(n) }));
    expect(MAX_ACCOUNTS_PER_DEVICE).toBe(3);
    expect(accountsOnDevice(users, [device])).toBe(3);
    expect(accountsOnDevice(users, [device]) >= MAX_ACCOUNTS_PER_DEVICE).toBe(true);
    expect(DEVICE_LIMIT_MESSAGE).toMatch(/three accounts/i);
  });

  it("counts a user once even if cookie and local token both match", () => {
    const users = [
      { role: "participant", deviceIds: ["cookie-id", "local-id"] },
      { role: "participant", deviceIds: ["cookie-id"] },
      { role: "admin", deviceIds: ["cookie-id"] },
    ];
    expect(accountsOnDevice(users, ["cookie-id", "local-id"])).toBe(2);
  });
});
