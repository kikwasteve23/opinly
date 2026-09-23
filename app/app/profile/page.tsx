import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { readStoreSnapshot } from "@/lib/store";
import { hitStudyEarningsCap, studyEarningsUsd } from "@/lib/referrals";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const profile = user.profile;
  const store = await readStoreSnapshot();
  const showReferral = hitStudyEarningsCap(studyEarningsUsd(store.studies, store.submissions, user.id));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Researchers see the demographics a study screened on, never your name or email.</p>
      <dl className="mt-8 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        <Row label="Email" value={user.email} />
        <Row label="Legal name" value={profile?.legalName ?? "—"} />
        <Row label="Country" value={profile?.country ?? "—"} />
        <Row label="City" value={profile ? `${profile.city}, ${profile.region}` : "—"} />
        <Row label="Languages" value={profile?.languages.join(", ") ?? "—"} />
        <Row label="Occupation" value={profile?.occupation ?? "—"} />
        <Row label="English assessment" value={user.englishPassed ? "Passed" : "Not finished"} />
        <Row label="Identity" value={user.identityStatus.replace("_", " ")} />
        {showReferral ? <Row label="Referral code" value={user.referralCode} /> : null}
        <Row label="Identity note" value={user.identityNote || "—"} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-5 py-3 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="col-span-2 font-medium">{value}</dd>
    </div>
  );
}
