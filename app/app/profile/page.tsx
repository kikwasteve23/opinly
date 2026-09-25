import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { hitWalletCap } from "@/lib/referrals";
import { OptionalIdForm, ProfilePhotoForm } from "@/components/profile-media";
import { RecoveryCodesSettings } from "@/components/recovery-codes-settings";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const profile = user.profile;
  const showReferral = hitWalletCap(user);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Add a profile picture. ID is optional and can wait until you are ready.
      </p>
      <ProfilePhotoForm photoUrl={user.photoUrl} />
      <dl className="mt-8 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        <Row label="Email" value={user.email} />
        <Row label="Legal name" value={profile?.legalName ?? "—"} />
        <Row label="Country" value={profile?.country ?? "—"} />
        <Row label="City" value={profile ? `${profile.city}, ${profile.region}` : "—"} />
        <Row label="Languages" value={profile?.languages.join(", ") ?? "—"} />
        <Row label="Occupation" value={profile?.occupation ?? "—"} />
        <Row label="English assessment" value={user.englishPassed ? "Passed" : "Not finished"} />
        {showReferral ? <Row label="Referral code" value={user.referralCode} /> : null}
      </dl>
      <OptionalIdForm
        identityStatus={user.identityStatus}
        identityNote={user.identityNote}
        country={profile?.country ?? ""}
      />
      <RecoveryCodesSettings remaining={user.recoveryCodeHashes.length} />
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
