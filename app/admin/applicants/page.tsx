import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { setIdentityAction } from "@/lib/admin-actions";

export default async function ApplicantsPage() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const applicants = store.users.filter((u) => u.role === "participant" && (u.identityStatus === "pending" || u.identityStatus === "rejected"));

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Applicants</h1>
      <p className="mt-1 text-sm text-gray-600">ID is optional. People can take studies without it. Review any documents they send from Profile. Open the profile if you need the full picture.</p>
      <div className="mt-6 space-y-4">
        {applicants.length === 0 ? <p className="text-sm text-gray-500">No applications waiting.</p> : null}
        {applicants.map((person) => (
          <article key={person.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{person.profile?.legalName || person.email}</h2>
                <p className="text-sm text-gray-500">{person.email}</p>
                <p className="mt-2 text-sm text-gray-600">
                  {person.profile ? `${person.profile.city}, ${person.profile.region}, ${person.profile.country}` : "Profile incomplete"}
                  {person.profile ? ` · ${person.profile.occupation}` : ""}
                </p>
                <p className="mt-1 text-xs text-gray-500">{person.identityNote || "No reviewer note yet."}</p>
                {person.englishWriting ? (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-950">{person.englishWriting}</p>
                ) : null}
              </div>
              <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs capitalize text-amber-900">{person.identityStatus}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/admin/people/${person.id}`} className="rounded-lg border px-3 py-2 text-sm font-semibold">
                Preview profile
              </Link>
              <form action={setIdentityAction}>
                <input type="hidden" name="userId" value={person.id} />
                <input type="hidden" name="status" value="approved" />
                <input type="hidden" name="note" value="Approved after application review." />
                <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
              </form>
              <form action={setIdentityAction} className="flex gap-2">
                <input type="hidden" name="userId" value={person.id} />
                <input type="hidden" name="status" value="rejected" />
                <input name="note" placeholder="Rejection reason" className="rounded-lg border px-3 py-2 text-sm" />
                <button className="rounded-lg border px-3 py-2 text-sm font-semibold">Reject</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
