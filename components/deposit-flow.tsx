"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitDepositRequestAction, sendDepositChatAction, type WalletState } from "@/lib/wallet-actions";
import { ACTIVATION_DEPOSIT } from "@/lib/money";
import { formatMoney, type CountryProfile, NOWPAYMENTS } from "@/lib/geo";
import { money } from "@/lib/utils";
import type { DepositRail } from "@/lib/deposit-rails";
import { CopyLine } from "@/components/copy-line";

type ChatItem = { id: string; from: "user" | "support"; body: string; createdAt: string; adminName: string | null };
type HireInfo = { id: string; name: string; quantity: number; cost: number; billing: "prepaid" | "postpaid" };

export function DepositDesk({
  country,
  activated,
  availableUsd,
  messages,
  hire,
  pending,
  localRail,
  cryptoRail,
}: {
  country: CountryProfile;
  activated: boolean;
  availableUsd: number;
  messages: ChatItem[];
  hire: HireInfo | null;
  pending: { amount: number; methodLabel: string; purpose: string } | null;
  localRail: DepositRail;
  cryptoRail: DepositRail;
}) {
  const [method, setMethod] = useState(country.local.id);
  const [payState, payAction, paying] = useActionState<WalletState, FormData>(submitDepositRequestAction, null);
  const [chatState, chatAction, chatting] = useActionState<WalletState, FormData>(sendDepositChatAction, null);
  const chatInput = useRef<HTMLInputElement>(null);
  const selected = method === NOWPAYMENTS.id ? cryptoRail : localRail;
  const usdAmount = hire ? hire.cost : ACTIVATION_DEPOSIT;
  const localAmount = formatMoney(usdAmount, country);
  const waiting = Boolean(pending) || Boolean(payState?.ok);

  useEffect(() => {
    if (chatState?.ok && chatInput.current) chatInput.current.value = "";
  }, [chatState]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-2xl font-extrabold">{hire ? "Pay for your hire" : "Deposit funds"}</h1>
        {hire ? (
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950">
            <p className="font-semibold">Order summary</p>
            <ul className="mt-2 space-y-1 text-gray-800 dark:text-gray-200">
              <li>Marketer: {hire.name}</li>
              <li>Referrals: {hire.quantity}</li>
              <li>Plan: {hire.billing === "postpaid" ? "Pay after pricing (+10%)" : "Pay before"}</li>
              <li>
                Total due: <strong>{money(hire.cost)}</strong> ({localAmount} in {country.name})
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Send the exact total, then tap that you have paid. The hire starts after an admin matches this transfer.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Activate your wallet with ${ACTIVATION_DEPOSIT}. That amount is added to your available balance after an
            admin matches a real transfer, and you can take it out with your first withdrawal. You currently have{" "}
            {formatMoney(availableUsd, country)} available.
          </p>
        )}
        {waiting ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Waiting on a match</p>
            <p className="mt-1">
              {pending
                ? `Your ${money(pending.amount)} ${pending.methodLabel} payment is with an admin${
                    pending.purpose === "marketer" ? " (marketer hire)" : " (wallet activation)"
                  }. Keep this page open and use chat if the pay-to details changed.`
                : payState?.ok}
            </p>
            <p className="mt-2 text-xs">Do not send a second payment until this one is approved or rejected.</p>
          </div>
        ) : null}
        {!hire && activated && !waiting ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">This wallet is already activated.</p>
        ) : waiting ? null : (
          <form action={payAction} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            {hire ? (
              <>
                <input type="hidden" name="marketerId" value={hire.id} />
                <input type="hidden" name="quantity" value={String(hire.quantity)} />
                <input type="hidden" name="billing" value={hire.billing} />
                <input type="hidden" name="viaDeposit" value="1" />
              </>
            ) : null}
            <label className="block text-sm font-medium">
              Payment method
              <select
                name="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:bg-gray-950"
              >
                <option value={country.local.id}>{localRail.methodName}</option>
                <option value={NOWPAYMENTS.id}>{cryptoRail.methodName}</option>
              </select>
            </label>
            {!selected.configured ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                Live pay-to details for this method are not published on the page yet. Use deposit chat — a real admin
                will send the exact account, paybill, or invoice before you send money.
              </p>
            ) : null}
            <div>
              <p className="text-sm font-semibold">How to pay with {selected.methodName}</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-800 dark:text-gray-200">
                {selected.steps.map((step) => (
                  <li key={step} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-950">
              <p>
                Send exactly: <strong>${usdAmount.toFixed(2)} USD</strong> ({localAmount})
              </p>
              <ul className="mt-2 space-y-2">
                {selected.payTo.map((line) => (
                  <CopyLine key={line} text={line} />
                ))}
              </ul>
            </div>
            {payState?.error ? <p className="text-sm text-red-600">{payState.error}</p> : null}
            <button disabled={paying} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
              {paying ? "Recording…" : "I have sent the payment"}
            </button>
          </form>
        )}
      </div>
      <aside className="flex min-h-[28rem] flex-col rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Deposit chat</h2>
        <p className="text-xs text-gray-500">A real admin reads this thread and replies. It is only for payments.</p>
        <ul className="mt-3 flex-1 space-y-2 overflow-auto text-sm">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`rounded-xl px-3 py-2 ${msg.from === "user" ? "ml-8 bg-indigo-50 dark:bg-indigo-950" : "mr-8 bg-gray-100 dark:bg-gray-800"}`}
            >
              <p className="text-[11px] uppercase text-gray-500">
                {msg.from === "user" ? "You" : msg.adminName || "Opinly"}
              </p>
              {msg.body}
              <p className="mt-1 text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</p>
            </li>
          ))}
        </ul>
        <form action={chatAction} className="mt-3 flex gap-2">
          <input
            ref={chatInput}
            name="body"
            required
            placeholder="Ask about pay-to details…"
            className="flex-1 rounded-xl border px-3 py-2 text-sm dark:bg-gray-950"
          />
          <button disabled={chatting} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
            Send
          </button>
        </form>
        {chatState?.ok ? <p className="mt-2 text-xs text-indigo-700">{chatState.ok}</p> : null}
        {chatState?.error ? <p className="mt-2 text-xs text-red-600">{chatState.error}</p> : null}
      </aside>
    </div>
  );
}
