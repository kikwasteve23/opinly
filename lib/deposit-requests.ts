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
    paidAt: billing === "prepaid" ? now : null,
    hiredAt: now,
    completeAt: new Date(Date.now() + randomDelay(60 * 60 * 1000, 2 * 60 * 60 * 1000)).toISOString(),
    completedAt: null,
    status: "processing",
    addedUserIds: [],
  });
}
