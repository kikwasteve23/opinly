"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareInvite } from "@/components/share-invite";
import { REFERRAL_JOIN_BONUS, SIGNUP_BONUS } from "@/lib/bonuses";
import { shareJoinBonusMessage } from "@/lib/referrals";
import { money } from "@/lib/utils";

export function ShareReferralPrompt({
  referralCode,
  continueHref = "/onboarding",
}: {
  referralCode: string;
  continueHref?: string;
}) {
  const [yes, setYes] = useState(false);
  const [link, setLink] = useState(`/register?ref=${encodeURIComponent(referralCode)}`);

  useEffect(() => {
    setLink(`${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`);
  }, [referralCode]);

  if (!yes) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-white p-6 dark:border-indigo-900 dark:bg-gray-900">
        <h2 className="text-xl font-extrabold">Share Opinly and earn extra</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          Your account is in. You already have a {money(SIGNUP_BONUS)} welcome bonus. Would you like to share this
          opportunity with others? You earn {money(REFERRAL_JOIN_BONUS)} for every person who joins with your link.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={continueHref} className="rounded-xl border px-4 py-2.5 text-center text-sm font-semibold">
            Not now
          </Link>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={() => setYes(true)}
          >
            Yes, I want to share
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-6 dark:border-indigo-900 dark:bg-gray-900">
      <h2 className="text-xl font-extrabold">Your invite</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Share this link. You earn {money(REFERRAL_JOIN_BONUS)} when someone joins with it. Code{" "}
        <span className="font-mono font-semibold">{referralCode}</span>.
      </p>
      <ShareInvite message={shareJoinBonusMessage(link)} />
      <Link href={continueHref} className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
        Continue to your profile
      </Link>
    </div>
  );
}
