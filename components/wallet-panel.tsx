"use client";

import { useEffect, useMemo, useState } from "react";
import { quoteWithdrawal, type PayoutNetwork } from "@/lib/money";
import { money } from "@/lib/utils";

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

export function WalletPanel({ initialUser }: { initialUser: UserWallet }) {
  const [user, setUser] = useState(initialUser);
  const [amount, setAmount] = useState(String(Math.max(10, Math.floor(initialUser.available))));
  const [network, setNetwork] = useState<PayoutNetwork>(initialUser.payout.network || "usdt_trc20");
  const [address, setAddress] = useState(initialUser.payout.address);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [history, setHistory] = useState<Withdrawal[]>([]);

  const quote = useMemo(() => quoteWithdrawal(Number(amount) || 0, network), [amount, network]);

  useEffect(() => {
    void fetch("/api/wallet")
      .then((r) => r.json())
      .then((data) => setHistory(data.withdrawals ?? []));
  }, []);

  async function withdraw() {
    setError("");
    setOk("");
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), network, address }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not send that withdrawal.");
      return;
    }
    setUser(data.user);
    setHistory((h) => [data.withdrawal, ...h]);
    setOk(`Withdrawal queued. ${money(data.quote.arrives)} will arrive at the address you entered.`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">Wallet</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Rewards sit in US dollars until you withdraw to a wallet you control.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Available" value={money(user.available)} />
          <Stat label="Pending" value={money(user.pending)} />
          <Stat label="Withdrawn" value={money(user.withdrawn)} />
        </div>
        <form
          className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          onSubmit={(e) => {
            e.preventDefault();
            void withdraw();
          }}
        >
          <h2 className="font-semibold">Request a withdrawal</h2>
          <label className="block text-sm font-medium">
            Amount (USD)
            <input
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
              required
              minLength={8}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {ok ? <p className="text-sm text-indigo-700">{ok}</p> : null}
          <button className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">Confirm withdrawal</button>
          <p className="text-xs text-gray-500">This demo records the request locally. No crypto is sent. Check the address and network before you ever do this with real funds.</p>
        </form>
      </div>
      <div>
        <h2 className="font-semibold">Recent withdrawals</h2>
        <div className="mt-4 space-y-3">
          {history.length === 0 ? <p className="text-sm text-gray-500">None yet. Let your balance build, then cash out.</p> : null}
          {history.map((item) => (
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
