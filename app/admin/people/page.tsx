import Link from "next/link";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { qualifiedReferralCount, REFERRAL_REQUIREMENT } from "@/lib/referrals";
import { money } from "@/lib/utils";

export default async function AdminPeople({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const store = await readStoreSnapshot();
  const query = q.trim().toLowerCase();
  const people = store.users
    .filter((u) => u.role === "participant")
    .filter((u) => !query || u.email.includes(query) || u.profile?.legalName?.toLowerCase().includes(query) || u.referralCode.toLowerCase().includes(query));

  return (
    <div>
      <h1 className="text-2xl font-extrabold">People</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email, name, or referral code"
          className="w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm"
        />
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Identity</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Referrals</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/people/${person.id}`} className="font-medium text-indigo-700">
                    {person.profile?.legalName || person.email}
                  </Link>
                  <p className="text-xs text-gray-500">{person.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{person.identityStatus.replace("_", " ")}</td>
                <td className="px-4 py-3">{money(person.available)}</td>
                <td className="px-4 py-3">
                  {qualifiedReferralCount(store.users, person.id)}/{REFERRAL_REQUIREMENT}
                </td>
                <td className="px-4 py-3 capitalize">{person.accountStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
