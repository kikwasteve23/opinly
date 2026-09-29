"use client";

import { useState } from "react";
import { dismissNoticeAction } from "@/lib/milestone-actions";
import type { UserNotice } from "@/lib/types";

export function DepositNoticePopup({ notice }: { notice: UserNotice | null }) {
  const [hidden, setHidden] = useState(false);
  if (!notice || hidden) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="deposit-notice-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <p className={`text-xs font-semibold uppercase tracking-wide ${notice.tone === "ok" ? "text-emerald-700" : "text-amber-800"}`}>
          {notice.tone === "ok" ? "Payment update" : "Payment not matched"}
        </p>
        <h2 id="deposit-notice-title" className="mt-2 text-lg font-bold">
          {notice.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{notice.body}</p>
        <div className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm dark:bg-indigo-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Next steps</p>
          <p className="mt-1 text-gray-800 dark:text-gray-200">{notice.nextSteps}</p>
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
          onClick={async () => {
            setHidden(true);
            await dismissNoticeAction(notice.id);
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
