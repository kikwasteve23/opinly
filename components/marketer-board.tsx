"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MARKETERS, marketerDepositPath } from "@/lib/marketers";
import { money } from "@/lib/utils";
import { HireCheckout } from "@/components/hire-checkout";
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
  const unpaid = jobs.find((j) => j.billing === "postpaid" && !j.paidAt);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Professional marketers</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
        Hire someone to fill your referral slots. Pay before at the listed price, or pay after pricing for 10% extra.
        Both options open a checkout, then a real deposit. Work starts after an admin matches the payment. They add
        approved people who have already completed a survey, usually within 1–2 hours.
      </p>
      {unpaid ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          You still owe {money(unpaid.amountDue)} for an earlier pay-after hire.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => router.push(marketerDepositPath(unpaid.marketerId, unpaid.quantity, "postpaid"))}
          >
            Pay now
          </button>
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {MARKETERS.map((marketer) => (
          <div
            key={marketer.id}
            className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <Link href={`/app/marketers/${marketer.slug}`} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={marketer.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div>
                <h2 className="font-semibold">{marketer.name}</h2>
                <p className="text-xs text-gray-500">{marketer.region}</p>
              </div>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">{marketer.headline}</p>
            <p className="text-sm">
              {money(marketer.priceEach)} per referral · lands in {marketer.hours}
            </p>
            <HireCheckout marketer={marketer} />
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-semibold">Your hires</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {jobs.length === 0 ? <li className="text-gray-500">None yet. Checkout records a deposit first — the hire list fills after an admin matches it.</li> : null}
        {jobs.map((job) => {
          const marketer = MARKETERS.find((m) => m.id === job.marketerId);
          const payLabel =
            job.billing === "postpaid"
              ? job.paidAt
                ? "paid after pricing"
                : "awaiting payment"
              : job.paidAt
                ? "paid before"
                : "awaiting payment";
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
