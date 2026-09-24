"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { MIN_WITHDRAWAL, quoteWithdrawal, type PayoutNetwork } from "@/lib/money";
import { money } from "@/lib/utils";
import { withdrawAction, type WalletState } from "@/lib/wallet-actions";
import { BRONZE_REFERRALS, levelName } from "@/lib/referrals";

type UserWallet = {
  available: number;
  pending: number;
  withdrawn: number;
  walletActivated: boolean;
  payout: { network: PayoutNetwork; address: string };
};

type Withdrawal = {
  id: string;
  network: PayoutNetwork;
  address: string;
  requested: number;
  platformFee: number;
  networkFee: number;
  arrives: number;
  status: string;
  createdAt: string;
};

const CRYPTO_STEPS = [
  "Payouts are crypto only. We send USDT on TRON (TRC20) or Litecoin. Bank apps and Capitec are for deposits, not withdrawals.",
  "Install a wallet that supports the network you pick (for USDT use a TRC20 address that starts with T; for Litecoin an address that starts with L or M or ltc1).",
  "Copy your receive address from that wallet. Double-check the network. The wrong chain cannot be recovered.",
  "Enter at least $500 USD, paste the address, and confirm. A 5% platform fee and the network fee come off the amount you request.",
  "An admin sends the crypto after review. Track status in Recent withdrawals on this page.",
];

export function WalletPanel({
  initialUser,
  initialHistory,
  referrals,
  showReferralTools,
  cashoutReady,
}: {
  initialUser: UserWallet;
  initialHistory: Withdrawal[];
  referrals: { qualified: number; level: number; code: string };
  showReferralTools: boolean;
  cashoutReady: boolean;
}) {
  const [amount, setAmount] = useState(String(MIN_WITHDRAWAL));
  const [network, setNetwork] = useState<PayoutNetwork>(initialUser.payout.network || "usdt_trc20");
  const [state, formAction, pending] = useActionState<WalletState, FormData>(withdrawAction, null);
  const quote = useMemo(() => quoteWithdrawal(Number(amount) || 0, network), [amount, network]);
  const needRefs = showReferralTools && referrals.qualified < BRONZE_REFERRALS;
  const needBalance = initialUser.available < MIN_WITHDRAWAL;
  const needActivation = cashoutReady && !initialUser.walletActivated;
  const canRequest = !needRefs && !needBalance && !needActivation;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">Wallet</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Earnings sit in US dollars. When you cash out, the money is sent as crypto to a wallet you control.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Available" value={money(initialUser.available)} />
          <Stat label="Pending" value={money(initialUser.pending)} hint="We are reviewing your responses." />
          <Stat label="Withdrawn" value={money(initialUser.withdrawn)} />
        </div>
        {showReferralTools ? (
          <div className="mt-4 space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
            <p>
              {levelName(referrals.level)} · {referrals.qualified}/{BRONZE_REFERRALS} active referrals for cash-out. Code{" "}
              <span className="font-mono font-semibold">{referrals.code}</span>.
            </p>
            <p>Minimum withdrawal is {money(MIN_WITHDRAWAL)}.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
            <p>Keep taking studies. Cash-out opens at {money(MIN_WITHDRAWAL)} available.</p>
          </div>
        )}
        <div className="mt-4 rounded-2xl border-2 border-indigo-600 bg-white p-5 dark:bg-gray-900">
          <h2 className="font-bold">How crypto withdrawal works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {CRYPTO_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        {needBalance || needRefs || needActivation ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            {needRefs ? <p>Reach Bronze with {BRONZE_REFERRALS} active referrals (approved people who finished a survey).</p> : null}
            {needBalance ? <p className="mt-1">Build available balance to {money(MIN_WITHDRAWAL)} with Bronze and Gold studies after you unlock them.</p> : null}
            {!needRefs && !needBalance && needActivation ? (
              <p className="mt-1">
                Activate your wallet on the{" "}
                <Link className="font-semibold underline" href="/app/deposit">
                  deposit funds
                </Link>{" "}
                page, then come back to withdraw crypto. The $50 is added to your balance.
              </p>
            ) : null}
          </div>
        ) : null}
        <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold">Request a crypto withdrawal</h2>
          <label className="block text-sm font-medium">
            Amount (USD)
            <input
              name="amount"
              type="number"
              min={MIN_WITHDRAWAL}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
            />
          </label>
          <label className="block text-sm font-medium">
            Crypto network
            <select
              name="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value as PayoutNetwork)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="usdt_trc20">USDT on TRON (TRC20) · $1.00 network fee</option>
              <option value="ltc">Litecoin (LTC) · $0.10 network fee</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Your wallet address
            <input
              name="address"
              required
              minLength={8}
              defaultValue={initialUser.payout.address}
              placeholder={network === "ltc" ? "L... or ltc1..." : "T... (TRC20 only)"}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
            />
          </label>
          <dl className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-950">
            <div>
              <dt className="text-gray-500">Platform 5%</dt>
              <dd className="font-semibold">{money(quote.platformFee)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Network</dt>
              <dd className="font-semibold">{money(quote.networkFee)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">You receive</dt>
              <dd className="font-semibold">{money(quote.arrives)}</dd>
            </div>
          </dl>
          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          {state?.ok ? <p className="text-sm text-indigo-700">{state.ok}</p> : null}
          <button type="submit" disabled={pending || !canRequest} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">
            {pending ? "Sending…" : "Send crypto payout request"}
          </button>
        </form>
      </div>
      <div>
        <h2 className="font-semibold">Recent withdrawals</h2>
        <div className="mt-4 space-y-3">
          {initialHistory.length === 0 && !state?.ok ? <p className="text-sm text-gray-500">None yet.</p> : null}
          {initialHistory.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex justify-between">
                <p className="font-semibold">{money(item.requested)}</p>
                <p className="capitalize text-gray-500">{item.status}</p>
              </div>
              <p className="mt-1 text-gray-500">
                {item.network === "ltc" ? "Litecoin" : "USDT TRC20"} · arrives {money(item.arrives)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-gray-500">{hint}</p> : null}
    </div>
  );
}
