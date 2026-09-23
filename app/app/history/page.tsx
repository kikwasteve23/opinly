import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { readStoreSnapshot } from "@/lib/store";
import { formatMoney } from "@/lib/geo";
import { resolveCountry } from "@/lib/resolve-geo";
import { isFinishedStudy, latestUserSubmission } from "@/lib/studies-data";
import { StudyCard } from "@/components/study-card";

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const store = await readStoreSnapshot();
  const submissions = store.submissions.filter((s) => s.userId === user.id);
  const country = await resolveCountry(user);

  const history = store.studies
    .flatMap((study) => {
      const mine = latestUserSubmission(submissions, study.id);
      if (!mine || !isFinishedStudy(mine.status)) return [];
      return [{ study, mine }];
    })
    .sort((a, b) => (b.mine.submittedAt ?? b.mine.updatedAt).localeCompare(a.mine.submittedAt ?? a.mine.updatedAt));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">History</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Studies you already submitted. They leave the open list so you can focus on new work.
          </p>
        </div>
        <Link href="/app" className="text-sm font-semibold text-indigo-700">
          Open studies
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            Nothing here yet. After you submit a study, it moves here from the Studies list.
          </p>
        ) : null}
        {history.map(({ study, mine }) => (
          <StudyCard
            key={study.id}
            study={study}
            status={mine.status}
            localPay={formatMoney(study.reward, country)}
            variant="history"
            finishedAt={mine.submittedAt ?? mine.updatedAt}
          />
        ))}
      </div>
    </div>
  );
}
