import { money } from "./utils";
import { findMarketer } from "./marketers";
import type { DepositRequest, UserNotice } from "./types";

export function buildDepositDecisionNotice(
  deposit: Pick<DepositRequest, "amount" | "purpose" | "marketerId" | "quantity" | "methodLabel">,
  decision: "approve" | "reject",
  adminNote: string | null,
): Pick<UserNotice, "kind" | "title" | "body" | "nextSteps" | "tone"> {
  const note = adminNote?.trim() || null;
  if (decision === "reject") {
    return {
      kind: "deposit_decision",
      tone: "warn",
      title: "We could not match that payment",
      body: note
        ? `Your ${money(deposit.amount)} ${deposit.methodLabel} transfer was not approved. Reason: ${note}`
        : `Your ${money(deposit.amount)} ${deposit.methodLabel} transfer was not approved.`,
      nextSteps:
        "Check the pay-to details on Deposit funds, send the exact amount, then tap I have sent the payment again. Use deposit chat if you need the account, paybill, or invoice.",
    };
  }
  if (deposit.purpose === "activation") {
    return {
      kind: "deposit_decision",
      tone: "ok",
      title: "Your activation payment was approved",
      body: note
        ? `We matched ${money(deposit.amount)}. That amount is now in your available balance. ${note}`
        : `We matched ${money(deposit.amount)}. That amount is now in your available balance and goes out with your first withdrawal.`,
      nextSteps: "You can join the lounge chat and keep taking studies. Open Wallet when you are ready to cash out.",
    };
  }
  const marketer = deposit.marketerId ? findMarketer(deposit.marketerId) : null;
  return {
    kind: "deposit_decision",
    tone: "ok",
    title: "Your marketer payment was approved",
    body: note
      ? `We matched ${money(deposit.amount)} for ${marketer?.name ?? "your hire"}. ${note}`
      : `We matched ${money(deposit.amount)} for ${marketer?.name ?? "your hire"}${
          deposit.quantity ? ` (${deposit.quantity} referrals)` : ""
        }. The hire is starting now.`,
    nextSteps: "Open Marketers to follow the job. Referrals land after the work completes — usually within one to two hours.",
  };
}
