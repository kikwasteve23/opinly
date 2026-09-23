import { ADDRESS_CHANGE_HOLD_MS, ACTIVATION_DEPOSIT, MIN_WITHDRAWAL, WITHDRAWAL_COOLDOWN_MS, quoteWithdrawal } from "./money";
import { canWithdrawByReferrals, LEVEL_2_REFERRALS } from "./referrals";
import { newId } from "./ids";
import type { PayoutNetwork, StoreData, User, Withdrawal } from "./types";

export function applyWithdrawal(
  data: StoreData,
  user: User,
  input: { amount: number; network: PayoutNetwork; address: string },
): { error: string } | { ok: string; withdrawal: Withdrawal } {
  if (user.accountStatus === "suspended") return { error: "This account is suspended." };
  if (user.identityStatus !== "approved") {
    return { error: "Withdrawals open after identity verification is approved." };
  }
  if (!canWithdrawByReferrals(data.users, data.submissions, user.id)) {
    return {
      error: `You need ${LEVEL_2_REFERRALS} active referrals (approved and finished at least one survey) before you can withdraw.`,
    };
  }
  if (!user.walletActivated) {
    return {
      error: `Activate your wallet with a $${ACTIVATION_DEPOSIT.toFixed(0)} deposit first. That money is added to your available balance, not charged as a fee.`,
    };
  }
  const quote = quoteWithdrawal(input.amount, input.network);
  if (!quote.valid) {
    return { error: `The minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(0)}.` };
  }
  if (quote.requested > user.available) return { error: "That is more than your available balance." };
  const now = Date.now();
  if (user.lastWithdrawalAt && now - new Date(user.lastWithdrawalAt).getTime() < WITHDRAWAL_COOLDOWN_MS) {
    return { error: "You can request one withdrawal every 72 hours." };
  }
  if (user.payout.address && user.payout.address !== input.address && user.payout.addressChangedAt) {
    if (now - new Date(user.payout.addressChangedAt).getTime() < ADDRESS_CHANGE_HOLD_MS) {
      return { error: "Withdrawals pause for 24 hours after you change a payout address." };
    }
  }
  if (user.payout.address && user.payout.address !== input.address) {
    user.payout.addressChangedAt = new Date().toISOString();
  }
  user.payout = {
    network: input.network,
    address: input.address.trim(),
    addressChangedAt: user.payout.addressChangedAt,
  };
  user.available = Math.round((user.available - quote.requested) * 100) / 100;
  user.withdrawn = Math.round((user.withdrawn + quote.requested) * 100) / 100;
  user.lastWithdrawalAt = new Date().toISOString();
  const withdrawal: Withdrawal = {
    id: newId("wd"),
    userId: user.id,
    network: input.network,
    address: input.address.trim(),
    requested: quote.requested,
    platformFee: quote.platformFee,
    networkFee: quote.networkFee,
    arrives: quote.arrives,
    status: "processing",
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    adminNote: null,
  };
  data.withdrawals.unshift(withdrawal);
  data.ledger.unshift({
    id: newId("led"),
    userId: user.id,
    amount: -quote.requested,
    type: "withdrawal",
    note: `Withdrawal ${withdrawal.id}`,
    createdAt: new Date().toISOString(),
    adminEmail: null,
  });
  return { ok: `Withdrawal queued. $${quote.arrives.toFixed(2)} will arrive after an admin marks it sent.`, withdrawal };
}
