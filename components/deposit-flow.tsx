"use client";

import { useActionState, useState } from "react";
import { confirmActivationDepositAction, sendDepositChatAction, type WalletState } from "@/lib/wallet-actions";
import { ACTIVATION_DEPOSIT } from "@/lib/money";
import { formatMoney, type CountryProfile, type LocalPayment, NOWPAYMENTS } from "@/lib/geo";

type ChatItem = { id: string; from: "user" | "support"; body: string };

export function DepositDesk({
  country,
  activated,
  availableUsd,
  messages,
}: {
  country: CountryProfile;
  activated: boolean;
  availableUsd: number;
  messages: ChatItem[];
}) {
  const [method, setMethod] = useState(country.local.id);
  const [payState, payAction, paying] = useActionState<WalletState, FormData>(confirmActivationDepositAction, null);
  const [chatState, chatAction, chatting] = useActionState<WalletState, FormData>(sendDepositChatAction, null);
  const selected: LocalPayment = method === NOWPAYMENTS.id ? NOWPAYMENTS : country.local;
  const localAmount = formatMoney(ACTIVATION_DEPOSIT, country);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">Deposit funds</h1>
        <p className="mt-2 text-sm text-gray-600">
          You have reached the ${500} withdrawal floor. To send a payout, activate the wallet with ${ACTIVATION_DEPOSIT}. That
          amount is credited to your available balance ({formatMoney(availableUsd, country)} now) and can be withdrawn with
          your earnings. Detected location: <strong>{country.name}</strong>.
        </p>
        {activated ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">This wallet is already activated. You can request a withdrawal from the wallet page.</p>
        ) : (
          <form action={payAction} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <label className="block text-sm font-medium">
              Payment method
              <select
                name="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1.5 w-full rounded-xl border px-3 py-2.5"
              >
                <option value={country.local.id}>
                  {country.local.name} · {country.currency}
                </option>
                <option value={NOWPAYMENTS.id}>{NOWPAYMENTS.name}</option>
              </select>
            </label>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
              {selected.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p>
                Amount: <strong>${ACTIVATION_DEPOSIT.toFixed(0)} USD</strong> ({localAmount})
              </p>
              {method === NOWPAYMENTS.id ? (
                <p className="mt-2 font-mono text-xs">NOWPayments invoice · USDT TRC20 · TOpinlyDemoInvoice9xK2</p>
              ) : (
                <p className="mt-2 text-xs">
                  Pay to Opinly {country.local.name} desk for {country.name}. Reference: your email.
                </p>
              )}
            </div>
            {payState?.error ? <p className="text-sm text-red-600">{payState.error}</p> : null}
            {payState?.ok ? <p className="text-sm text-indigo-700">{payState.ok}</p> : null}
            <button disabled={paying} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
              {paying ? "Recording…" : "I have sent the payment"}
            </button>
          </form>
        )}
      </div>
      <aside className="flex min-h-[28rem] flex-col rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Deposit chat</h2>
        <p className="text-xs text-gray-500">Support for this payment only. Chat is not shown on other pages.</p>
        <ul className="mt-3 flex-1 space-y-2 overflow-auto text-sm">
          {messages.length === 0 ? <li className="text-gray-500">Ask how to pay in {country.name}.</li> : null}
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`rounded-xl px-3 py-2 ${msg.from === "user" ? "ml-8 bg-indigo-50" : "mr-8 bg-gray-100 dark:bg-gray-800"}`}
            >
              <p className="text-[11px] uppercase text-gray-500">{msg.from === "user" ? "You" : "Opinly"}</p>
              {msg.body}
            </li>
          ))}
        </ul>
        <form action={chatAction} className="mt-3 flex gap-2">
          <input name="body" required placeholder="Ask about M-Pesa, UPI, NOWPayments…" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
          <button disabled={chatting} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
            Send
          </button>
        </form>
        {chatState?.error ? <p className="mt-2 text-xs text-red-600">{chatState.error}</p> : null}
      </aside>
    </div>
  );
}
