"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { MIN_WITHDRAWAL, quoteWithdrawal, type PayoutNetwork } from "@/lib/money";
import { money } from "@/lib/utils";
import { withdrawAction, type WalletState } from "@/lib/wallet-actions";
import { LEVEL_2_REFERRALS } from "@/lib/referrals";

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

export function WalletPanel({
  initialUser,
  initialHistory,
  referrals,
  localLabel,
  localMethods,
}: {
  initialUser: UserWallet;
  initialHistory: Withdrawal[];
  referrals: { qualified: number; level: number; code: string };
  localLabel: string;
  localMethods: string;
}) {
  const [amount, setAmount] = useState(String(MIN_WITHDRAWAL));
  const [network, setNetwork] = useState<PayoutNetwork>(initialUser.payout.network || "usdt_trc20");
  const [state, formAction, pending] = useActionState<WalletState, FormData>(withdrawAction, null);
  const quote = useMemo(() => quoteWithdrawal(Number(amount) || 0, network), [amount, network]);
  const needRefs = referrals.qualified < LEVEL_2_REFERRALS;
  const needBalance = initialUser.available < MIN_WITHDRAWAL;
  const needActivation = !initialUser.walletActivated;
  const canRequest = !needRefs && !needBalance && !needActivation;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">Wallet</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          We store your balance in US dollars. Based on {localLabel}, amounts also show in local terms and payouts prefer{" "}
          {localMethods}.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Available" value={money(initialUser.available)} />
          <Stat label="Pending" value={money(initialUser.pending)} />
          <Stat label="Withdrawn" value={money(initialUser.withdrawn)} />
        </div>
        <div className="mt-4 space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
          <p>
            Level {referrals.level} · {referrals.qualified}/{LEVEL_2_REFERRALS} active referrals for cash-out. Code{" "}
            <span className="font-mono font-semibold">{referrals.code}</span>.
          </p>
          <p>Minimum withdrawal is {money(MIN_WITHDRAWAL)}. A ${50} activation deposit is added to this balance, not taken as a fee.</p>
        </div>
        {needBalance || needRefs || needActivation ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            {needRefs ? <p>Reach level 2 with {LEVEL_2_REFERRALS} active referrals (approved people who finished a survey).</p> : null}
            {needBalance ? <p className="mt-1">Build available balance to {money(MIN_WITHDRAWAL)} with level 2 studies.</p> : null}
            {!needRefs && !needBalance && needActivation ? (
              <p className="mt-1">
                Activate your wallet on the{" "}
                <Link className="font-semibold underline" href="/app/deposit">
                  deposit funds
                </Link>{" "}
                page, then come back to withdraw.
              </p>
            ) : null}
          </div>
        ) : null}
        <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold">Request a withdrawal</h2>
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
            Network
            <select
              name="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value as PayoutNetwork)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="usdt_trc20">USDT (TRC20) · $1.00 network fee</option>
              <option value="ltc">Litecoin (LTC) · $0.10 network fee</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Payout address
            <input
              name="address"
              required
              minLength={8}
              defaultValue={initialUser.payout.address}
              placeholder={network === "ltc" ? "L..." : "T..."}
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
            {pending ? "Sending…" : "Confirm withdrawal"}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
