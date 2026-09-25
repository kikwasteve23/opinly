"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ENGLISH_QUESTIONS, OPEN_COUNTRIES } from "@/lib/onboarding-data";
import { saveEnglishAction, saveProfileAction, type OnboardingState } from "@/lib/onboarding-actions";
import type { User } from "@/lib/types";

export function OnboardingFlow({ user }: { user: Omit<User, "passwordHash"> }) {
  const step = user.onboardingStep === "english" || user.englishPassed ? "english" : "profile";
  const [profileState, profileAction, savingProfile] = useActionState<OnboardingState, FormData>(saveProfileAction, null);
  const [englishState, englishAction, savingEnglish] = useActionState<OnboardingState, FormData>(saveEnglishAction, null);
  const error = step === "english" ? englishState?.error : profileState?.error;
  const pending = step === "english" ? savingEnglish : savingProfile;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Logo />
        <ol className="mt-8 flex gap-2 text-xs font-semibold">
          {[
            { id: "profile", label: "About you" },
            { id: "english", label: "English" },
          ].map((item, index) => (
            <li
              key={item.id}
              className={`flex-1 rounded-full px-3 py-2 text-center ${
                item.id === step ? "bg-indigo-600 text-white" : "bg-white text-gray-600 dark:bg-gray-900"
              }`}
            >
              {index + 1}. {item.label}
            </li>
          ))}
        </ol>

        {step === "profile" ? (
          <form action={profileAction} className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-2xl font-extrabold">Tell us about you</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Researchers use this to match you. Keep it true; it is what cuts down screen-outs later.
            </p>
            <Field name="legalName" label="Legal name" defaultValue={user.profile?.legalName ?? ""} />
            <Field name="dateOfBirth" label="Date of birth" type="date" defaultValue={user.profile?.dateOfBirth ?? ""} />
            <Field name="city" label="City" defaultValue={user.profile?.city ?? ""} />
            <Field name="region" label="State or region" defaultValue={user.profile?.region ?? ""} />
            <Field name="postalCode" label="Postal code" defaultValue={user.profile?.postalCode ?? ""} />
            <Field name="occupation" label="Occupation" defaultValue={user.profile?.occupation ?? ""} />
            <Field
              name="languages"
              label="Languages (comma separated)"
              defaultValue={user.profile?.languages?.join(", ") ?? "English"}
            />
            <label className="block text-sm font-medium">
              Gender
              <select
                name="gender"
                required
                defaultValue={user.profile?.gender ?? ""}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="">Select</option>
                <option>Woman</option>
                <option>Man</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Country
              <select
                name="country"
                required
                defaultValue={user.profile?.country ?? "United States"}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
              >
                {OPEN_COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {error ? <ErrorNote error={error} /> : null}
            <button disabled={pending} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">
              {pending ? "Saving…" : "Continue"}
            </button>
          </form>
        ) : (
          <form action={englishAction} className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-2xl font-extrabold">English assessment</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Studies are written in English. You need two of the three questions right, plus a short writing sample.
            </p>
            {ENGLISH_QUESTIONS.map((q) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-medium">{q.prompt}</legend>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={q.id} value={opt} required />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <label className="block text-sm font-medium">
              In a few sentences, describe a recent product or service you used and what you thought of it.
              <textarea
                name="writing"
                required
                minLength={40}
                rows={5}
                defaultValue={user.englishWriting ?? ""}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
              />
            </label>
            {error ? <ErrorNote error={error} /> : null}
            <button disabled={pending} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">
              {pending ? "Checking…" : "Start earning"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
      />
    </label>
  );
}

function ErrorNote({ error }: { error: string }) {
  const needsLogin = /session expired|sign in required/i.test(error);
  return (
    <p className="text-sm text-red-600">
      {error}{" "}
      {needsLogin ? (
        <Link href="/login" className="font-semibold underline">
          Log in
        </Link>
      ) : null}
    </p>
  );
}
