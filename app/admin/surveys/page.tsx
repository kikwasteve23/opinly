import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { money } from "@/lib/utils";
import { deleteSurveyAction, toggleSurveyAction } from "@/lib/admin-actions";

export default async function AdminSurveysPage() {
  await requireAdmin();
  const store = await readStoreSnapshot();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Surveys</h1>
          <p className="mt-1 text-sm text-gray-600">Write a study yourself or generate a draft with AI, then publish it to the participant dashboard.</p>
        </div>
        <Link href="/admin/surveys/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          New survey
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {store.studies.length === 0 ? <p className="text-sm text-gray-500">No surveys yet. Create one to put work on the dashboard.</p> : null}
        {store.studies.map((study) => (
          <div key={study.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
            <div className="flex-1">
              <p className="font-semibold">{study.title}</p>
              <p className="text-sm text-gray-500">
                {study.published ? "Live" : "Draft"} · {money(study.reward)} · {study.questions.length} questions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/surveys/${study.id}`} className="rounded-lg border px-3 py-2 text-sm font-semibold">
                Edit
              </Link>
              <form action={toggleSurveyAction}>
                <input type="hidden" name="id" value={study.id} />
                <button className="rounded-lg border px-3 py-2 text-sm font-semibold">{study.published ? "Unpublish" : "Publish"}</button>
              </form>
              <form action={deleteSurveyAction}>
                <input type="hidden" name="id" value={study.id} />
                <button className="rounded-lg border px-3 py-2 text-sm font-semibold text-red-700">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
