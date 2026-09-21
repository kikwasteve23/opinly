import { quoteWithdrawal } from "../lib/money";
import { describe, expect, it } from "vitest";

describe("quoteWithdrawal", () => {
  it("subtracts platform and network fees from the requested amount", () => {
    const usdt = quoteWithdrawal(20, "usdt_trc20");
    expect(usdt.platformFee).toBe(1);
    expect(usdt.networkFee).toBe(1);
    expect(usdt.arrives).toBe(18);
    expect(usdt.valid).toBe(true);

    const ltc = quoteWithdrawal(10, "ltc");
    expect(ltc.platformFee).toBe(0.5);
    expect(ltc.networkFee).toBe(0.1);
    expect(ltc.arrives).toBe(9.4);
  });

  it("rejects amounts under the $10 minimum", () => {
    expect(quoteWithdrawal(9.99, "ltc").valid).toBe(false);
  });
});
