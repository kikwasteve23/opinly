"use client";

import { useActionState } from "react";
import { submitOptionalIdAction, uploadProfilePhotoAction, type ProfileMediaState } from "@/lib/profile-actions";

export function ProfilePhotoForm({ photoUrl }: { photoUrl: string | null }) {
  const [state, action, pending] = useActionState<ProfileMediaState, FormData>(uploadProfilePhotoAction, null);
  return (
    <form action={action} className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold">Profile picture</h2>
      <p className="mt-1 text-sm text-gray-500">Add a clear photo of yourself. Researchers never see this; it is for your account.</p>
      <div className="mt-4 flex items-center gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Your profile" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
            Photo
          </div>
        )}
        <label className="block flex-1 text-sm">
          Upload image
          <input name="photo" type="file" accept="image/*" required className="mt-1 block w-full text-sm" />
        </label>
      </div>
      {state?.error ? <p className="mt-3 text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="mt-3 text-sm text-indigo-700">{state.ok}</p> : null}
      <button disabled={pending} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : photoUrl ? "Replace photo" : "Save photo"}
      </button>
    </form>
  );
}

export function OptionalIdForm({
  identityStatus,
  identityNote,
  country,
}: {
  identityStatus: string;
  identityNote: string;
  country: string;
}) {
  const [state, action, pending] = useActionState<ProfileMediaState, FormData>(submitOptionalIdAction, null);
  const waiting = identityStatus === "pending";
  const approved = identityStatus === "approved";
  return (
    <form action={action} className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold">Identity document (optional)</h2>
      <p className="mt-1 text-sm text-gray-500">
        You can take studies without this. Add a government ID later if you want extra protection before a withdrawal.
      </p>
      <p className="mt-2 text-sm capitalize text-gray-600">Status: {identityStatus.replace("_", " ")}</p>
      {identityNote ? <p className="mt-1 text-xs text-gray-500">{identityNote}</p> : null}
      {approved ? <p className="mt-3 text-sm text-indigo-700">Your ID is already approved.</p> : null}
      {waiting ? <p className="mt-3 text-sm text-amber-800">An admin is reviewing the document you sent.</p> : null}
      {!approved ? (
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Document type
            <select name="documentType" className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="Passport">
              <option>Passport</option>
              <option>Driver licence</option>
              <option>National ID card</option>
            </select>
          </label>
          <label className="block text-sm">
            Issuing country
            <input name="issuingCountry" defaultValue={country} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            Photo of the ID
            <input name="idPhoto" type="file" accept="image/*" required className="mt-1 block w-full text-sm" />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consent" className="mt-1" />
            I consent to Opinly reviewing this document.
          </label>
        </div>
      ) : null}
      {state?.error ? <p className="mt-3 text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="mt-3 text-sm text-indigo-700">{state.ok}</p> : null}
      {!approved ? (
        <button disabled={pending} className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-60">
          {pending ? "Sending…" : waiting ? "Resubmit ID" : "Submit ID"}
        </button>
      ) : null}
    </form>
  );
}
