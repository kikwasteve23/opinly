import { describe, expect, it } from "vitest";
import { DEPOSIT_WELCOME, depositRail } from "../lib/deposit-rails";
import { waitingDepositThreadCount } from "../lib/deposit-chat";

describe("deposit rails and live chat", () => {
  it("opens with a real support prompt, not a canned FAQ", () => {
    expect(DEPOSIT_WELCOME).toBe("Having trouble with deposits? Send us your message.");
  });

  it("does not invent pay-to numbers when env is empty", () => {
    const zelle = depositRail("US", "zelle");
    expect(zelle.configured).toBe(false);
    expect(zelle.steps.join(" ")).toMatch(/deposit chat/i);
    expect(zelle.payTo.join(" ")).not.toMatch(/\d{8,}/);

    const crypto = depositRail("US", "nowpayments");
    expect(crypto.configured).toBe(false);
    expect(crypto.steps.join(" ")).toMatch(/deposit chat/i);
    expect(crypto.payTo.join(" ").toLowerCase()).toContain("ask in deposit chat");
  });

  it("prints live USDT details only when configured", () => {
    const prev = process.env.DEPOSIT_USDT_TRC20;
    process.env.DEPOSIT_USDT_TRC20 = "TExampleAddressForTests111111111111";
    try {
      const crypto = depositRail("KE", "nowpayments");
      expect(crypto.configured).toBe(true);
      expect(crypto.steps.join(" ")).toContain("TExampleAddressForTests111111111111");
    } finally {
      if (prev === undefined) delete process.env.DEPOSIT_USDT_TRC20;
      else process.env.DEPOSIT_USDT_TRC20 = prev;
    }
  });

  it("counts threads waiting on staff", () => {
    const n = waitingDepositThreadCount([
      { userId: "a", from: "support" },
      { userId: "a", from: "user" },
      { userId: "b", from: "user" },
      { userId: "b", from: "support" },
    ]);
    expect(n).toBe(1);
  });
});
