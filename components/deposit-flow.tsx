"use client";

import { useActionState, useState } from "react";
import { submitDepositRequestAction, sendDepositChatAction, type WalletState } from "@/lib/wallet-actions";
import { ACTIVATION_DEPOSIT } from "@/lib/money";
import { formatMoney, type CountryProfile, type LocalPayment, NOWPAYMENTS } from "@/lib/geo";
import { money } from "@/lib/utils";

type ChatItem = { id: string; from: "user" | "support"; body: string };
type HireInfo = { id: string; name: string; quantity: number; cost: number };

export function DepositDesk({
  country,
  activated,
  availableUsd,
  messages,
  hire,
  pending,
}: {
  country: CountryProfile;
  activated: boolean;
  availableUsd: number;
  messages: ChatItem[];
  hire: HireInfo | null;
  pending: { amount: number; methodLabel: string; purpose: string } | null;
}) {
  const defaultMethod = country.code === "ZA" ? country.local.id : country.local.id;
  const [method, setMethod] = useState(defaultMethod);
  const [payState, payAction, paying] = useActionState<WalletState, FormData>(submitDepositRequestAction, null);
  const [chatState, chatAction, chatting] = useActionState<WalletState, FormData>(sendDepositChatAction, null);
  const selected: LocalPayment = method === NOWPAYMENTS.id ? NOWPAYMENTS : country.local;
  const usdAmount = hire ? hire.cost : ACTIVATION_DEPOSIT;
  const localAmount = formatMoney(usdAmount, country);
  const za = country.code === "ZA";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">Deposit funds</h1>
        {hire ? (
          <p className="mt-2 text-sm text-gray-600">
            Pay <strong>{money(hire.cost)}</strong> to hire {hire.name} for {hire.quantity} active referrals. An admin
            must approve the payment before they start. Detected location: <strong>{country.name}</strong>.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            You have reached the $500 withdrawal floor. Activate the wallet with ${ACTIVATION_DEPOSIT}. That amount is
            added to your available balance after an admin approves the payment ({formatMoney(availableUsd, country)} now).
            Detected location: <strong>{country.name}</strong>.
          </p>
        )}
        {za ? (
          <div className="mt-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="font-bold">South Africa: use Capitec</p>
            <p className="mt-1">
              Capitec is the method we match first. Follow the numbered Capitec steps below. Other banks are slower to
              clear.
            </p>
          </div>
        ) : null}
        {pending ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Your {money(pending.amount)} {pending.methodLabel} payment is waiting for admin approval
            {pending.purpose === "marketer" ? " (marketer hire)" : " (wallet activation)"}.
          </p>
        ) : null}
        {!hire && activated && !pending ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">This wallet is already activated. You can request a crypto withdrawal from the wallet page.</p>
        ) : (
          <form action={payAction} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            {hire ? (
              <>
                <input type="hidden" name="marketerId" value={hire.id} />
                <input type="hidden" name="quantity" value={String(hire.quantity)} />
                <input type="hidden" name="viaDeposit" value="1" />
              </>
            ) : null}
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
                  {za ? " — recommended" : ""}
                </option>
                <option value={NOWPAYMENTS.id}>{NOWPAYMENTS.name}</option>
              </select>
            </label>
            <div className={za && method === country.local.id ? "rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-4" : ""}>
              <p className="text-sm font-semibold">{selected.name} — steps</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-800">
                {selected.steps.map((step) => (
                  <li key={step} className="font-medium leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p>
                Amount: <strong>${usdAmount.toFixed(2)} USD</strong> ({localAmount})
              </p>
              {method === NOWPAYMENTS.id ? (
                <p className="mt-2 font-mono text-xs">NOWPayments invoice · USDT TRC20 · TOpinlyDemoInvoice9xK2</p>
              ) : za ? (
                <p className="mt-2 text-xs">
                  Capitec · 1480054321 · branch 470010 · reference = your Opinly email · {localAmount}
                </p>
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
          {messages.length === 0 ? (
            <li className="text-gray-500">{za ? "Ask anything about Capitec Pay or the reference field." : `Ask how to pay in ${country.name}.`}</li>
          ) : null}
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
          <input name="body" required placeholder={za ? "Capitec account, branch code, reference…" : "Ask about local pay or NOWPayments…"} className="flex-1 rounded-xl border px-3 py-2 text-sm" />
          <button disabled={chatting} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
            Send
          </button>
        </form>
        {chatState?.error ? <p className="mt-2 text-xs text-red-600">{chatState.error}</p> : null}
      </aside>
    </div>
  );
}
