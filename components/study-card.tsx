import Link from "next/link";
import type { Study } from "@/lib/types";
import { isFinishedStudy, kindLabel, questionCountLabel, tierLabel } from "@/lib/studies-data";
import { money } from "@/lib/utils";

export function StudyCard({
  study,
  status,
  localPay,
  reason,
  rejectionReason,
  variant = "available",
  finishedAt,
}: {
  study: Pick<Study, "id" | "title" | "summary" | "kind" | "tier" | "reward" | "minutes" | "format" | "questions">;
  status: string;
  localPay?: string;
  reason?: string | null;
  rejectionReason?: string | null;
  variant?: "available" | "history";
  finishedAt?: string | null;
}) {
  const done = isFinishedStudy(status);
  const locked = variant === "available" && Boolean(reason) && !done;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">{study.title}</h2>
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {kindLabel(study.kind)}
          </span>
          <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs text-violet-800">{tierLabel(study.tier)}</span>
          {status !== "available" ? (
            <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {status.replace("_", " ")}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{study.summary}</p>
        <p className="mt-2 text-xs text-gray-500">
          {questionCountLabel(study.questions.length)} · About {study.minutes} minutes · {study.format}
          {localPay ? ` · ${localPay}` : ""}
          {finishedAt ? ` · ${new Date(finishedAt).toLocaleString()}` : ""}
        </p>
        {rejectionReason ? <p className="mt-2 text-sm text-red-600">{rejectionReason}</p> : null}
        {reason && variant === "available" ? <p className="mt-2 text-sm text-amber-800">{reason}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {money(study.reward)}
        </span>
        {variant === "history" || done ? (
          <span className="text-sm text-gray-500">{status === "pending_review" ? "In review" : "Completed"}</span>
        ) : locked ? (
          <span className="text-sm text-gray-500">Locked</span>
        ) : (
          <Link href={`/app/studies/${study.id}`} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            {status === "in_progress" ? "Continue" : status === "rejected" ? "Retake" : "Start study"}
          </Link>
        )}
      </div>
    </article>
  );
}
