"use client";

import { useActionState } from "react";
import { recordDepositAction, type AdminFormState } from "@/lib/admin-actions";
import { money } from "@/lib/utils";

type Person = { id: string; email: string; available: number; name: string };
type Entry = { id: string; userId: string; amount: number; type: string; note: string; createdAt: string; adminEmail: string | null };

export function DepositDesk({ people, ledger }: { people: Person[]; ledger: Entry[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(recordDepositAction, null);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form action={action} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Record a deposit or debit</h2>
        <p className="text-sm text-gray-500">Credits increase available balance. Use a negative amount to take money off.</p>
        <label className="block text-sm">
          Person
          <select name="userId" required className="mt-1 w-full rounded-lg border px-3 py-2">
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.email} · {money(person.available)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Amount (USD)
          <input name="amount" type="number" step="0.01" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Note
          <input name="note" required placeholder="Manual deposit, bonus, correction…" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state?.ok ? <p className="text-sm text-indigo-700">{state.ok}</p> : null}
        <button disabled={pending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          {pending ? "Saving…" : "Post to ledger"}
        </button>
      </form>
      <div>
        <h2 className="font-semibold">Recent ledger</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {ledger.length === 0 ? <li className="text-gray-500">Nothing posted yet.</li> : null}
          {ledger.slice(0, 30).map((entry) => {
            const person = people.find((p) => p.id === entry.userId);
            return (
              <li key={entry.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                <p className="font-medium">
                  {entry.amount > 0 ? "+" : ""}
                  {money(entry.amount)} · {entry.type}
                </p>
                <p className="text-gray-500">{person?.email ?? entry.userId}</p>
                <p className="text-gray-500">{entry.note}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
