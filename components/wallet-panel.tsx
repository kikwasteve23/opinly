"use client";

import { useActionState, useMemo, useState } from "react";
import { quoteWithdrawal, type PayoutNetwork } from "@/lib/money";
import { money } from "@/lib/utils";
import { withdrawAction, type WalletState } from "@/lib/wallet-actions";

type UserWallet = {
  available: number;
  pending: number;
  withdrawn: number;
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
}: {
  initialUser: UserWallet;
  initialHistory: Withdrawal[];
  referrals: { qualified: number; required: number; code: string };
}) {
  const [amount, setAmount] = useState("10");
  const [network, setNetwork] = useState<PayoutNetwork>(initialUser.payout.network || "usdt_trc20");
  const [state, formAction, pending] = useActionState<WalletState, FormData>(withdrawAction, null);
  const quote = useMemo(() => quoteWithdrawal(Number(amount) || 0, network), [amount, network]);
  const locked = referrals.qualified < referrals.required;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">Wallet</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Rewards sit in US dollars until you withdraw to a wallet you control.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Available" value={money(initialUser.available)} />
          <Stat label="Pending" value={money(initialUser.pending)} />
          <Stat label="Withdrawn" value={money(initialUser.withdrawn)} />
        </div>
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
          Referrals for withdrawals: <strong>{referrals.qualified}/{referrals.required}</strong> verified. Your code is{" "}
          <span className="font-mono font-semibold">{referrals.code}</span>.
          {locked ? " You can earn, but cash-out stays closed until you hit the threshold." : ""}
        </div>
        <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold">Request a withdrawal</h2>
          <label className="block text-sm font-medium">
            Amount (USD)
            <input
              name="amount"
              type="number"
              min={10}
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
          <button type="submit" disabled={pending || locked} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">
            {locked ? `Need ${referrals.required - referrals.qualified} more verified referrals` : pending ? "Sending…" : "Confirm withdrawal"}
          </button>
          <p className="text-xs text-gray-500">An admin sends the crypto after review. Check the address and network. Wrong-chain payments cannot be recovered.</p>
        </form>
      </div>
      <div>
        <h2 className="font-semibold">Recent withdrawals</h2>
        <div className="mt-4 space-y-3">
          {initialHistory.length === 0 && !state?.ok ? <p className="text-sm text-gray-500">None yet. Let your balance build, then cash out.</p> : null}
          {initialHistory.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex justify-between">
                <p className="font-semibold">{money(item.requested)}</p>
                <p className="capitalize text-gray-500">{item.status}</p>
              </div>
              <p className="mt-1 text-gray-500">
                {item.network === "ltc" ? "Litecoin" : "USDT TRC20"} · arrives {money(item.arrives)}
              </p>
              <p className="mt-1 truncate text-xs text-gray-400">{item.address}</p>
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
