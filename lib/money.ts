export type PayoutNetwork = "usdt_trc20" | "ltc";

export const PLATFORM_FEE_RATE = 0.05;
export const MIN_WITHDRAWAL = 500;
export const ACTIVATION_DEPOSIT = 50;
export const WITHDRAWAL_COOLDOWN_MS = 72 * 60 * 60 * 1000;
export const ADDRESS_CHANGE_HOLD_MS = 24 * 60 * 60 * 1000;
export const INACTIVITY_MS = 25 * 60 * 1000;
export const TEXT_MIN_CHARS = 8;
export const ATTENTION_RETRY =
  "You missed an attention check. Refresh the page and start this survey over. Read every question before you answer.";
export const AUTO_APPROVE_MIN_MS = 30 * 60 * 1000;
export const AUTO_APPROVE_MAX_MS = 60 * 60 * 1000;

export const NETWORK_FEES: Record<PayoutNetwork, number> = {
  usdt_trc20: 1,
  ltc: 0.1,
};

export function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

export function quoteWithdrawal(amount: number, network: PayoutNetwork) {
  const requested = roundCents(amount);
  const platformFee = roundCents(requested * PLATFORM_FEE_RATE);
  const networkFee = NETWORK_FEES[network];
  const arrives = roundCents(requested - platformFee - networkFee);
  return {
    requested,
    platformFee,
    networkFee,
    arrives,
    valid: requested >= MIN_WITHDRAWAL && arrives > 0,
  };
}

export function randomDelay(minMs: number, maxMs: number) {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

export function autoApproveAt(from = Date.now()) {
  return new Date(from + randomDelay(AUTO_APPROVE_MIN_MS, AUTO_APPROVE_MAX_MS)).toISOString();
}
