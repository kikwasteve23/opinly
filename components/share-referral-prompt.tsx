"use client";

import { useEffect, useState } from "react";
import { ShareInvite } from "@/components/share-invite";
import { dismissShareInviteAction } from "@/lib/milestone-actions";
import { REFERRAL_JOIN_BONUS, SIGNUP_BONUS } from "@/lib/bonuses";
import { shareJoinBonusMessage } from "@/lib/referrals";
import { money } from "@/lib/utils";

export function ShareReferralPrompt({ referralCode }: { referralCode: string }) {
  const [yes, setYes] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [link, setLink] = useState(`/register?ref=${encodeURIComponent(referralCode)}`);

  useEffect(() => {
    setLink(`${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`);
  }, [referralCode]);

  async function close() {
    setHidden(true);
    await dismissShareInviteAction();
  }

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="share-invite-title"
        className="w-full max-w-md rounded-2xl border border-indigo-200 bg-white p-6 shadow-xl dark:border-indigo-900 dark:bg-gray-900"
      >
        {yes ? (
          <>
            <h2 id="share-invite-title" className="text-xl font-extrabold">
              Your invite
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Share this link. You earn {money(REFERRAL_JOIN_BONUS)} when someone joins with it. Code{" "}
              <span className="font-mono font-semibold">{referralCode}</span>.
            </p>
            <ShareInvite message={shareJoinBonusMessage(link)} />
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              onClick={() => void close()}
            >
              Go to studies
            </button>
          </>
        ) : (
          <>
            <h2 id="share-invite-title" className="text-xl font-extrabold">
              Share Opinly and earn extra
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              You passed the English check. You already have a {money(SIGNUP_BONUS)} welcome bonus. Would you like to
              share this opportunity with others? You earn {money(REFERRAL_JOIN_BONUS)} for every person who joins with
              your link.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
                onClick={() => void close()}
              >
                Not now
              </button>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => setYes(true)}
              >
                Yes, I want to share
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
