import { newId } from "./ids";
import { randomDelay } from "./money";
import { findMarketer, marketerQuote } from "./marketers";
import { NOWPAYMENTS, COUNTRIES } from "./geo";
import type { MarketerBilling, StoreData } from "./types";

export function paymentMethodLabel(method: string) {
  if (method === NOWPAYMENTS.id) return NOWPAYMENTS.name;
  const match = COUNTRIES.find((c) => c.local.id === method);
  return match?.local.name ?? method;
}

export function startMarketerJob(
  data: StoreData,
  userId: string,
  marketerId: string,
  quantity: number,
  billing: MarketerBilling = "prepaid",
) {
  const marketer = findMarketer(marketerId);
  if (!marketer) return;
  const { amount } = marketerQuote(marketer.priceEach, quantity, billing);
  const now = new Date().toISOString();
  data.marketerJobs.unshift({
    id: newId("job"),
    userId,
    marketerId: marketer.id,
    quantity,
    priceEach: marketer.priceEach,
    billing,
    amountDue: amount,
    paidAt: now,
    hiredAt: now,
    completeAt: new Date(Date.now() + randomDelay(60 * 60 * 1000, 2 * 60 * 60 * 1000)).toISOString(),
    completedAt: null,
    status: "processing",
    addedUserIds: [],
  });
}

/** After an admin matches a marketer deposit: settle an unpaid invoice, or start the hire. */
export function fulfillPaidMarketerHire(
  data: StoreData,
  userId: string,
  marketerId: string,
  quantity: number,
  billing: MarketerBilling,
) {
  const unpaid = data.marketerJobs.find(
    (j) =>
      j.userId === userId &&
      j.marketerId === marketerId &&
      j.quantity === quantity &&
      j.billing === "postpaid" &&
      !j.paidAt,
  );
  if (unpaid) {
    unpaid.paidAt = new Date().toISOString();
    return "settled" as const;
  }
  startMarketerJob(data, userId, marketerId, quantity, billing);
  return "started" as const;
}
