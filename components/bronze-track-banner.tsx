import Link from "next/link";
import { BRONZE_REFERRALS } from "@/lib/referrals";

export function BronzeTrackBanner({ inviteLink, qualified }: { inviteLink: string; qualified: number }) {
  const remaining = Math.max(0, BRONZE_REFERRALS - qualified);
  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
      <p className="font-semibold">Congratulations on earning $400.</p>
      <p className="mt-2">
        That is a genuine step forward, and you are now on the Bronze track. Bronze surveys unlock when you have at
        least {BRONZE_REFERRALS} active referrals
        {remaining > 0 ? ` (${remaining} more to go)` : ""}.
      </p>
      <p className="mt-2">
        You can earn referrals by sharing your invite link with friends, or by hiring our marketers — they are ready to
        promote it. Hiring includes pay-before and pay-after plans. Visit the{" "}
        <Link className="font-semibold underline" href="/app/marketers">
          Marketers
        </Link>{" "}
        page to compare them.
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-amber-800">Your invite link</p>
      <a href={inviteLink} className="mt-1 block break-all font-medium text-indigo-800 underline">
        {inviteLink}
      </a>
      <p className="mt-3">
        You can also copy it from{" "}
        <Link className="font-semibold underline" href="/app/referrals">
          Referrals
        </Link>
        . Thank you for being part of Opinly.
      </p>
    </div>
  );
}
