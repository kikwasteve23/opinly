import { ACTIVATION_DEPOSIT, MIN_WITHDRAWAL, quoteWithdrawal } from "../lib/money";
import { describe, expect, it } from "vitest";

describe("quoteWithdrawal", () => {
  it("subtracts platform and network fees from the requested amount", () => {
    const usdt = quoteWithdrawal(500, "usdt_trc20");
    expect(usdt.platformFee).toBe(25);
    expect(usdt.networkFee).toBe(1);
    expect(usdt.arrives).toBe(474);
    expect(usdt.valid).toBe(true);

    const ltc = quoteWithdrawal(500, "ltc");
    expect(ltc.platformFee).toBe(25);
    expect(ltc.networkFee).toBe(0.1);
    expect(ltc.arrives).toBe(474.9);
  });

  it("rejects amounts under the $500 minimum", () => {
    expect(MIN_WITHDRAWAL).toBe(500);
    expect(ACTIVATION_DEPOSIT).toBe(30);
    expect(quoteWithdrawal(499.99, "ltc").valid).toBe(false);
  });
});
