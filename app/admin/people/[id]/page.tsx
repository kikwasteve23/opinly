import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { countsFromStore, LEVEL_2_REFERRALS } from "@/lib/referrals";
import { money } from "@/lib/utils";
import { adjustWalletAction, setAccountStatusAction, setIdentityAction } from "@/lib/admin-actions";
import { AdminReferralsDesk } from "@/components/admin-referrals-desk";
import { referralStatusLabel } from "@/lib/admin-referrals";
import { findStudy } from "@/lib/studies-data";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const store = await readStoreSnapshot();
  const person = store.users.find((u) => u.id === id);
  if (!person || person.role !== "participant") notFound();
  const referrals = store.users.filter((u) => u.referredBy === person.id);
  const submissions = store.submissions.filter((s) => s.userId === person.id);
  const withdrawals = store.withdrawals.filter((w) => w.userId === person.id);
  const ledger = store.ledger.filter((entry) => entry.userId === person.id);
  const profile = person.profile;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-indigo-700">
          <Link href="/admin/people">← People</Link>
        </p>
        <div className="mt-2 flex items-center gap-3">
          {person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
              No photo
            </span>
          )}
          <div>
            <h1 className="text-2xl font-extrabold">{profile?.legalName || person.email}</h1>
            <p className="text-sm text-gray-500">
              {person.email} · code {person.referralCode} · joined {new Date(person.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Available" value={money(person.available)} />
        <Stat label="Pending" value={money(person.pending)} />
        <Stat label="Withdrawn" value={money(person.withdrawn)} />
        <Stat label="Qualified referrals" value={`${countsFromStore(store, person.id).qualified}/${LEVEL_2_REFERRALS}`} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Profile preview</h2>
        {profile ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Field label="Legal name" value={profile.legalName} />
            <Field label="Date of birth" value={profile.dateOfBirth} />
            <Field label="Gender" value={profile.gender} />
            <Field label="Occupation" value={profile.occupation} />
            <Field label="City" value={profile.city} />
            <Field label="Region" value={profile.region} />
            <Field label="Country" value={profile.country} />
            <Field label="Postal code" value={profile.postalCode} />
            <Field label="Languages" value={profile.languages.join(", ") || "—"} />
            <Field label="English check" value={person.englishPassed ? "Passed" : "Not passed"} />
          </dl>
        ) : (
          <p className="mt-2 text-sm text-gray-500">This person has not finished the profile step.</p>
        )}
        {person.englishWriting ? (
          <div className="mt-4">
            <p className="text-xs uppercase text-gray-500">English writing sample</p>
            <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-950">{person.englishWriting}</p>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-gray-500">
          Payout: {person.payout.network === "ltc" ? "Litecoin" : "USDT TRC20"}
          {person.payout.address ? ` · ${person.payout.address}` : " · no address yet"}
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Identity (optional)</h2>
        <p className="mt-1 text-sm text-gray-500">{person.identityNote || "No ID uploaded yet. Studies do not require this."}</p>
        {person.identityImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.identityImageUrl} alt="Uploaded ID" className="mt-3 max-h-64 rounded-xl border object-contain" />
        ) : null}
        <form action={setIdentityAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="userId" value={person.id} />
          <label className="text-sm">
            Status
            <select name="status" defaultValue={person.identityStatus} className="mt-1 block rounded-lg border px-3 py-2">
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
          <label className="flex-1 text-sm">
            Note
            <input name="note" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Reviewer note" />
          </label>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Wallet adjustment</h2>
        <form action={adjustWalletAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="userId" value={person.id} />
          <label className="text-sm">
            Amount (use negative to debit)
            <input name="amount" type="number" step="0.01" required className="mt-1 block rounded-lg border px-3 py-2" />
          </label>
          <label className="flex-1 text-sm">
            Reason
            <input name="note" required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Apply</button>
        </form>
        <form action={setAccountStatusAction} className="mt-4">
          <input type="hidden" name="userId" value={person.id} />
          <input type="hidden" name="status" value={person.accountStatus === "suspended" ? "active" : "suspended"} />
          <button className="text-sm font-semibold text-red-700">
            {person.accountStatus === "suspended" ? "Reactivate account" : "Suspend account"}
          </button>
        </form>
      </section>

      <AdminReferralsDesk
        userId={person.id}
        referrals={referrals.map((ref) => ({
          id: ref.id,
          email: ref.email,
          status: referralStatusLabel(store, ref),
        }))}
      />

      <section>
        <h2 className="font-semibold">Studies</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {submissions.length === 0 ? <li className="text-gray-500">No studies yet.</li> : null}
          {submissions.map((s) => (
            <li key={s.id}>
              {findStudy(store.studies, s.studyId)?.title ?? s.studyId} · {s.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Withdrawals</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {withdrawals.length === 0 ? <li className="text-gray-500">No withdrawals yet.</li> : null}
          {withdrawals.map((w) => (
            <li key={w.id}>
              {money(w.requested)} · {w.status} · {w.network}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Ledger</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {ledger.length === 0 ? <li className="text-gray-500">No ledger entries.</li> : null}
          {ledger.map((entry) => (
            <li key={entry.id}>
              {entry.amount > 0 ? "+" : ""}
              {money(entry.amount)} · {entry.type} · {entry.note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-gray-500">{label}</dt>
      <dd className="mt-0.5">{value || "—"}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
