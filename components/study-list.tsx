"use client";

import { useMemo, useState } from "react";
import type { Study } from "@/lib/types";
import { StudyCard } from "@/components/study-card";

const PAGE_SIZE = 6;

export type StudyListItem = {
  study: Pick<Study, "id" | "title" | "summary" | "kind" | "tier" | "reward" | "minutes" | "format" | "questions">;
  status: string;
  localPay?: string;
  reason?: string | null;
  rejectionReason?: string | null;
};

export function StudyList({ items }: { items: StudyListItem[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const visible = useMemo(() => items.slice(0, shown), [items, shown]);
  const remaining = Math.max(0, items.length - visible.length);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
        No open studies right now. Anything you have already submitted lives in History.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((item) => (
        <StudyCard
          key={item.study.id}
          study={item.study}
          status={item.status}
          localPay={item.localPay}
          reason={item.reason}
          rejectionReason={item.rejectionReason}
        />
      ))}
      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE_SIZE)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-indigo-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-indigo-300"
        >
          See more ({remaining} left)
        </button>
      ) : null}
    </div>
  );
}
