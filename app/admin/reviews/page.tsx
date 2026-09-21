import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { getStudy } from "@/lib/studies-data";
import { money } from "@/lib/utils";
import { reviewSubmissionAction } from "@/lib/admin-actions";

export default async function AdminReviews() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const pending = store.submissions.filter((s) => s.status === "pending_review");
  const byId = Object.fromEntries(store.users.map((u) => [u.id, u]));

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Study reviews</h1>
      <p className="mt-1 text-sm text-gray-600">Approved work moves from pending into the participant’s available balance.</p>
      <div className="mt-6 space-y-4">
        {pending.length === 0 ? <p className="text-sm text-gray-500">Nothing waiting.</p> : null}
        {pending.map((item) => {
          const study = getStudy(item.studyId);
          const person = byId[item.userId];
          return (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <p className="font-semibold">{study?.title ?? item.studyId}</p>
              <p className="text-sm text-gray-500">
                <Link className="text-indigo-700" href={`/admin/people/${item.userId}`}>
                  {person?.email}
                </Link>{" "}
                · {study ? money(study.reward) : ""}
              </p>
              <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs">{JSON.stringify(item.answers, null, 2)}</pre>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={reviewSubmissionAction}>
                  <input type="hidden" name="submissionId" value={item.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Approve and pay</button>
                </form>
                <form action={reviewSubmissionAction} className="flex gap-2">
                  <input type="hidden" name="submissionId" value={item.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <input name="note" placeholder="Rejection reason" className="rounded-lg border px-3 py-2 text-sm" />
                  <button className="rounded-lg border px-3 py-2 text-sm font-semibold">Reject</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
