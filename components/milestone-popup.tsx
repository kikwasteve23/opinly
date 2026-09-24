"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dismissMilestoneAction } from "@/lib/milestone-actions";
import type { MilestoneCard } from "@/lib/milestones";

export function MilestonePopup({ milestone }: { milestone: MilestoneCard | null }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  if (!milestone || hidden) return null;

  async function close() {
    setHidden(true);
    await dismissMilestoneAction(milestone!.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-labelledby="milestone-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 id="milestone-title" className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
          {milestone.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{milestone.body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
            onClick={() => void close()}
          >
            Later
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={async () => {
              await close();
              router.push(milestone.nextHref);
            }}
          >
            {milestone.nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
