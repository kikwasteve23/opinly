import { describe, expect, it } from "vitest";
import { fulfillPaidMarketerHire, startMarketerJob } from "../lib/deposit-requests";
import {
  MARKETERS,
  clampMarketerQty,
  findMarketer,
  marketerDepositPath,
  marketerQuote,
} from "../lib/marketers";
import { HOW_IT_WORKS_TESTIMONIALS } from "../lib/testimonials";
import type { StoreData } from "../lib/types";

function emptyStore(): StoreData {
  return { users: [], submissions: [], withdrawals: [], studies: [], ledger: [], marketerJobs: [], chat: [], deposits: [], chatShortcuts: [], notices: [] };
}

describe("marketer profiles and checkout math", () => {
  it("gives every marketer a photo, bio, and slug", () => {
    expect(MARKETERS).toHaveLength(5);
    for (const person of MARKETERS) {
      expect(person.photo).toMatch(/^\/marketers\/.+\.png$/);
      expect(person.bio.length).toBeGreaterThan(40);
      expect(person.slug.length).toBeGreaterThan(3);
      expect(findMarketer(person.slug)?.id).toBe(person.id);
    }
  });

  it("builds a deposit URL with the calculated billing", () => {
    expect(marketerDepositPath("mkt_amina", 20, "prepaid")).toBe("/app/deposit?hire=mkt_amina&qty=20&billing=prepaid");
    expect(marketerQuote(5, 20, "prepaid").amount).toBe(100);
    expect(marketerQuote(5, 20, "postpaid").amount).toBe(110);
    expect(clampMarketerQty(MARKETERS[0], 20)).toBe(20);
    expect(clampMarketerQty(MARKETERS[0], 2)).toBeNull();
  });
});

describe("paid marketer hires", () => {
  it("starts a job only after payment, for both billing types", () => {
    const prepaid = emptyStore();
    expect(fulfillPaidMarketerHire(prepaid, "u1", "mkt_amina", 8, "prepaid")).toBe("started");
    expect(prepaid.marketerJobs[0].paidAt).toBeTruthy();
    expect(prepaid.marketerJobs[0].billing).toBe("prepaid");
    expect(prepaid.marketerJobs[0].amountDue).toBe(40);

    const postpaid = emptyStore();
    expect(fulfillPaidMarketerHire(postpaid, "u1", "mkt_amina", 8, "postpaid")).toBe("started");
    expect(postpaid.marketerJobs[0].paidAt).toBeTruthy();
    expect(postpaid.marketerJobs[0].amountDue).toBe(44);
  });

  it("settles a leftover unpaid pay-after job instead of simulating a second hire", () => {
    const data = emptyStore();
    startMarketerJob(data, "u1", "mkt_amina", 8, "postpaid");
    data.marketerJobs[0].paidAt = null;
    expect(fulfillPaidMarketerHire(data, "u1", "mkt_amina", 8, "postpaid")).toBe("settled");
    expect(data.marketerJobs).toHaveLength(1);
    expect(data.marketerJobs[0].paidAt).toBeTruthy();
  });
});

describe("how it works testimonials", () => {
  it("lists five people with photos", () => {
    expect(HOW_IT_WORKS_TESTIMONIALS).toHaveLength(5);
    for (const person of HOW_IT_WORKS_TESTIMONIALS) {
      expect(person.photo).toMatch(/^\/testimonials\/.+\.png$/);
      expect(person.quote.length).toBeGreaterThan(40);
    }
  });
});
