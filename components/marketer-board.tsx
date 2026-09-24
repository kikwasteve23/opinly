"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { MARKETERS, marketerQuote, type Marketer } from "@/lib/marketers";
import { money } from "@/lib/utils";
import { hireMarketerPayAfterAction, type WalletState } from "@/lib/wallet-actions";
import type { MarketerBilling } from "@/lib/types";

type JobRow = {
  id: string;
  marketerId: string;
  quantity: number;
  status: string;
  completeAt: string;
  billing: MarketerBilling;
  amountDue: number;
  paidAt: string | null;
};

export function MarketerBoard({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [payAfterState, payAfterAction, payingAfter] = useActionState<WalletState, FormData>(hireMarketerPayAfterAction, null);
  const unpaid = jobs.find((j) => j.billing === "postpaid" && !j.paidAt && j.status === "complete");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Professional marketers</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
        Hire someone to fill your referral slots. Pay before at the listed price, or pay after the referrals land for 10%
        extra. They add approved people who have already completed a survey, usually within 1–2 hours.
      </p>
      {unpaid ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Your referrals are in. Pay {money(unpaid.amountDue)} (includes 10%) to settle this hire.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() =>
              router.push(
                `/app/deposit?hire=${encodeURIComponent(unpaid.marketerId)}&qty=${unpaid.quantity}&billing=postpaid`,
              )
            }
          >
            Pay now
          </button>
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {MARKETERS.map((marketer) => (
          <MarketerCard key={marketer.id} marketer={marketer} payAfterAction={payAfterAction} payingAfter={payingAfter} />
        ))}
      </div>
      {payAfterState?.error ? <p className="mt-4 text-sm text-red-600">{payAfterState.error}</p> : null}
      {payAfterState?.ok ? <p className="mt-4 text-sm text-indigo-700">{payAfterState.ok}</p> : null}
      <h2 className="mt-10 font-semibold">Your hires</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {jobs.length === 0 ? <li className="text-gray-500">None yet.</li> : null}
        {jobs.map((job) => {
          const marketer = MARKETERS.find((m) => m.id === job.marketerId);
          const payLabel = job.billing === "postpaid" ? (job.paidAt ? "paid after" : "pay after — due") : "paid before";
          return (
            <li key={job.id} className="rounded-xl border px-4 py-3">
              {marketer?.name ?? job.marketerId} · {job.quantity} referrals · {job.status} · {payLabel} · {money(job.amountDue)}
              {job.status === "processing" ? ` · due ${new Date(job.completeAt).toLocaleString()}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MarketerCard({
  marketer,
  payAfterAction,
  payingAfter,
}: {
  marketer: Marketer;
  payAfterAction: (payload: FormData) => void;
  payingAfter: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(marketer.minOrder);
  const prepaid = marketerQuote(marketer.priceEach, qty, "prepaid");
  const postpaid = marketerQuote(marketer.priceEach, qty, "postpaid");

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold">{marketer.name}</h2>
      <p className="text-sm text-gray-600">{marketer.headline}</p>
      <p className="text-sm">
        {money(marketer.priceEach)} per referral · lands in {marketer.hours}
      </p>
      <label className="block text-sm">
        How many
        <input
          type="number"
          min={marketer.minOrder}
          max={marketer.maxOrder}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </label>
      <button
        type="button"
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => {
          const valid = Number.isInteger(qty) && qty >= marketer.minOrder && qty <= marketer.maxOrder;
          if (!valid) return;
          router.push(`/app/deposit?hire=${encodeURIComponent(marketer.id)}&qty=${qty}&billing=prepaid`);
        }}
      >
        Pay before — {money(prepaid.amount)}
      </button>
      <form action={payAfterAction}>
        <input type="hidden" name="marketerId" value={marketer.id} />
        <input type="hidden" name="quantity" value={String(qty)} />
        <button disabled={payingAfter} className="w-full rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-800 disabled:opacity-60">
          Pay after referrals — {money(postpaid.amount)} (10% extra)
        </button>
      </form>
    </div>
  );
}
