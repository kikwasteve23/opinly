"use client";

import { useActionState } from "react";
import { hireMarketerAction, type WalletState } from "@/lib/wallet-actions";
import { MARKETERS } from "@/lib/marketers";
import { money } from "@/lib/utils";

export function MarketerBoard({
  available,
  jobs,
}: {
  available: number;
  jobs: { id: string; marketerId: string; quantity: number; status: string; completeAt: string }[];
}) {
  const [state, action, pending] = useActionState<WalletState, FormData>(hireMarketerAction, null);
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Professional marketers</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Hire someone to fill your referral slots. They add approved people who have already completed a survey, usually
        within 1–2 hours. Prices are $5–$10 per active referral. Paid from your available balance ({money(available)}).
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {MARKETERS.map((marketer) => (
          <form key={marketer.id} action={action} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <input type="hidden" name="marketerId" value={marketer.id} />
            <h2 className="font-semibold">{marketer.name}</h2>
            <p className="text-sm text-gray-600">{marketer.headline}</p>
            <p className="text-sm">
              {money(marketer.priceEach)} per referral · lands in {marketer.hours}
            </p>
            <label className="block text-sm">
              How many
              <input
                name="quantity"
                type="number"
                min={marketer.minOrder}
                max={marketer.maxOrder}
                defaultValue={marketer.minOrder}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            <button disabled={pending} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Hire
            </button>
          </form>
        ))}
      </div>
      {state?.error ? <p className="mt-4 text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="mt-4 text-sm text-indigo-700">{state.ok}</p> : null}
      <h2 className="mt-10 font-semibold">Your hires</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {jobs.length === 0 ? <li className="text-gray-500">None yet.</li> : null}
        {jobs.map((job) => {
          const marketer = MARKETERS.find((m) => m.id === job.marketerId);
          return (
            <li key={job.id} className="rounded-xl border px-4 py-3">
              {marketer?.name ?? job.marketerId} · {job.quantity} referrals · {job.status}
              {job.status === "processing" ? ` · due ${new Date(job.completeAt).toLocaleString()}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
