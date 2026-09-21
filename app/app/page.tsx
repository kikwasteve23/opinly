import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { mutateStore } from "@/lib/store";
import { STUDIES, kindLabel } from "@/lib/studies-data";
import { money } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const submissions = await mutateStore((data) => data.submissions.filter((s) => s.userId === user.id));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-800 p-5 text-white">
          <p className="text-sm text-indigo-100">Wallet balance</p>
          <p className="mt-1 text-3xl font-bold">{money(user.available)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Pending review</p>
          <p className="mt-1 text-3xl font-bold">{money(user.pending)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Withdrawn</p>
          <p className="mt-1 text-3xl font-bold">{money(user.withdrawn)}</p>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Studies for you</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Pay and length are shown before you start. Progress saves as you go.</p>
        </div>
        <Link href="/app/wallet" className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
          Withdraw
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {STUDIES.map((study) => {
          const mine = submissions.filter((s) => s.studyId === study.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] as
            | (typeof submissions)[number]
            | undefined;
          const status = mine?.status ?? "available";
          const locked = status === "approved" || status === "pending_review";
          return (
            <div key={study.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{study.title}</h2>
                  <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{kindLabel(study.kind)}</span>
                  {status !== "available" ? (
                    <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {status.replace("_", " ")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{study.summary}</p>
                <p className="mt-2 text-xs text-gray-500">
                  About {study.minutes} minutes · {study.format} · {study.device}
                </p>
                {mine?.rejectionReason ? <p className="mt-2 text-sm text-red-600">{mine.rejectionReason}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {money(study.reward)}
                </span>
                {locked ? (
                  <span className="text-sm text-gray-500">Done</span>
                ) : (
                  <Link href={`/app/studies/${study.id}`} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    {status === "in_progress" ? "Continue" : status === "rejected" ? "Retake" : "Start study"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
