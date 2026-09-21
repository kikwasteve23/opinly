export type PayoutNetwork = "usdt_trc20" | "ltc";

export const PLATFORM_FEE_RATE = 0.05;
export const MIN_WITHDRAWAL = 10;
export const WITHDRAWAL_COOLDOWN_MS = 72 * 60 * 60 * 1000;
export const ADDRESS_CHANGE_HOLD_MS = 24 * 60 * 60 * 1000;

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
