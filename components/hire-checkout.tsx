"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clampMarketerQty, marketerDepositPath, marketerQuote, type Marketer } from "@/lib/marketers";
import { money } from "@/lib/utils";
import type { MarketerBilling } from "@/lib/types";

export function HireCheckout({ marketer, compact }: { marketer: Marketer; compact?: boolean }) {
  const router = useRouter();
  const [qty, setQty] = useState(marketer.minOrder);
  const [dialog, setDialog] = useState<MarketerBilling | null>(null);
  const validQty = clampMarketerQty(marketer, qty);
  const prepaid = marketerQuote(marketer.priceEach, validQty ?? marketer.minOrder, "prepaid");
  const postpaid = marketerQuote(marketer.priceEach, validQty ?? marketer.minOrder, "postpaid");
  const quote = dialog === "postpaid" ? postpaid : prepaid;

  function openPay(billing: MarketerBilling) {
    if (!validQty) return;
    setDialog(billing);
  }

  return (
    <>
      <label className="block text-sm">
        How many
        <input
          type="number"
          min={marketer.minOrder}
          max={marketer.maxOrder}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-950"
        />
      </label>
      {!validQty ? (
        <p className="text-xs text-red-600">
          Order between {marketer.minOrder} and {marketer.maxOrder} referrals.
        </p>
      ) : null}
      <button
        type="button"
        disabled={!validQty}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        onClick={() => openPay("prepaid")}
      >
        Pay before — {money(prepaid.amount)}
      </button>
      <button
        type="button"
        disabled={!validQty}
        className="w-full rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-800 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-200"
        onClick={() => openPay("postpaid")}
      >
        Pay after referrals — {money(postpaid.amount)} (10% extra)
      </button>
      {!compact ? (
        <Link href={`/app/marketers/${marketer.slug}`} className="inline-block text-sm font-semibold text-indigo-700">
          View profile
        </Link>
      ) : null}

      {dialog && validQty ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Thank you</p>
            <h2 className="mt-2 text-xl font-extrabold">Thanks for choosing {marketer.name}.</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              You asked for <strong>{validQty} referrals</strong>
              {dialog === "postpaid" ? " with pay-after pricing (10% extra)" : " at the listed price"}. Proceed to payment
              of the total calculated below. The hire starts after an admin matches your transfer — nothing is simulated
              on this page.
            </p>
            <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm dark:bg-indigo-950">
              <p>
                Total due: <strong className="text-lg">{money(quote.amount)}</strong>
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {validQty} × {money(marketer.priceEach)}
                {dialog === "postpaid" ? " + 10%" : ""}
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => router.push(marketerDepositPath(marketer.id, validQty, dialog))}
              >
                Proceed to payment
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                onClick={() => setDialog(null)}
              >
                Not yet
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
