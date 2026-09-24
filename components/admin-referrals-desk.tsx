"use client";

import { useActionState } from "react";
import { addReferralsAction, attachReferralAction, removeReferralAction, type AdminFormState } from "@/lib/admin-actions";

type Row = {
  id: string;
  email: string;
  status: string;
};

export function AdminReferralsDesk({ userId, referrals }: { userId: string; referrals: Row[] }) {
  const [addState, addAction, adding] = useActionState<AdminFormState, FormData>(addReferralsAction, null);
  const [attachState, attachAction, attaching] = useActionState<AdminFormState, FormData>(attachReferralAction, null);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold">Referrals</h2>
      <p className="mt-1 text-sm text-gray-500">
        Add or remove referrals for this person. Added people count as active (approved, finished a survey).
      </p>
      <form action={addAction} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="userId" value={userId} />
        <label className="text-sm">
          Add qualified referrals
          <input name="count" type="number" min={1} max={100} defaultValue={1} className="mt-1 block w-28 rounded-lg border px-3 py-2" />
        </label>
        <button disabled={adding} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {adding ? "Adding…" : "Add"}
        </button>
      </form>
      {addState?.error ? <p className="mt-2 text-sm text-red-600">{addState.error}</p> : null}
      {addState?.ok ? <p className="mt-2 text-sm text-indigo-700">{addState.ok}</p> : null}
      <form action={attachAction} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="userId" value={userId} />
        <label className="flex-1 text-sm">
          Link an existing email
          <input name="email" type="email" placeholder="person@email.com" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <button disabled={attaching} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-60">
          {attaching ? "Linking…" : "Link"}
        </button>
      </form>
      {attachState?.error ? <p className="mt-2 text-sm text-red-600">{attachState.error}</p> : null}
      {attachState?.ok ? <p className="mt-2 text-sm text-indigo-700">{attachState.ok}</p> : null}
      <ul className="mt-5 divide-y divide-gray-100 text-sm dark:divide-gray-800">
        {referrals.length === 0 ? <li className="py-2 text-gray-500">None yet.</li> : null}
        {referrals.map((ref) => (
          <li key={ref.id} className="flex items-center justify-between gap-3 py-2">
            <span>
              <a className="text-indigo-700" href={`/admin/people/${ref.id}`}>
                {ref.email}
              </a>{" "}
              · {ref.status}
            </span>
            <form action={removeReferralAction}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="referralId" value={ref.id} />
              <button className="text-xs font-semibold text-red-700">Remove</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
