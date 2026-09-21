"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { ENGLISH_QUESTIONS } from "@/lib/onboarding-data";
import type { User } from "@/lib/types";

export function OnboardingFlow({ user }: { user: Omit<User, "passwordHash"> }) {
  const router = useRouter();
  const initialStep = user.onboardingStep === "english" || user.onboardingStep === "identity" ? user.onboardingStep : "profile";
  const [step, setStep] = useState<"profile" | "english" | "identity">(initialStep);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const [profile, setProfile] = useState({
    legalName: user.profile?.legalName ?? "",
    dateOfBirth: user.profile?.dateOfBirth ?? "",
    gender: user.profile?.gender ?? "",
    country: user.profile?.country ?? "United States",
    city: user.profile?.city ?? "",
    region: user.profile?.region ?? "",
    postalCode: user.profile?.postalCode ?? "",
    languages: user.profile?.languages?.join(", ") ?? "English",
    occupation: user.profile?.occupation ?? "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState(user.englishWriting ?? "");
  const [documentType, setDocumentType] = useState("Passport");
  const [issuingCountry, setIssuingCountry] = useState(profile.country);
  const [consent, setConsent] = useState(false);

  const steps = useMemo(
    () => [
      { id: "profile", label: "About you" },
      { id: "english", label: "English" },
      { id: "identity", label: "Identity" },
    ],
    [],
  );

  async function submit(body: Record<string, unknown>, next?: "english" | "identity") {
    setError("");
    setPending(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save that step.");
      return;
    }
    if (data.user?.onboardingStep === "complete") {
      router.push("/app");
      router.refresh();
      return;
    }
    if (next) setStep(next);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Logo />
        <ol className="mt-8 flex gap-2 text-xs font-semibold">
          {steps.map((item, index) => (
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
          <form
            className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(
                {
                  step: "profile",
                  ...profile,
                  languages: profile.languages.split(",").map((s) => s.trim()).filter(Boolean),
                },
                "english",
              );
            }}
          >
            <h1 className="text-2xl font-extrabold">Tell us about you</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Researchers use this to match you. Keep it true; it is what cuts down screen-outs later.</p>
            {[
              ["legalName", "Legal name", "text"],
              ["dateOfBirth", "Date of birth", "date"],
              ["city", "City", "text"],
              ["region", "State or region", "text"],
              ["postalCode", "Postal code", "text"],
              ["occupation", "Occupation", "text"],
              ["languages", "Languages (comma separated)", "text"],
            ].map(([key, label, type]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <input
                  type={type}
                  required
                  value={profile[key as keyof typeof profile]}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
                />
              </label>
            ))}
            <label className="block text-sm font-medium">
              Gender
              <select
                required
                value={profile.gender}
                onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="">Select</option>
                <option>Woman</option>
                <option>Man</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button disabled={pending} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
              Continue
            </button>
          </form>
        ) : null}

        {step === "english" ? (
          <form
            className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            onSubmit={(e) => {
              e.preventDefault();
              void submit({ step: "english", answers, writing }, "identity");
            }}
          >
            <h1 className="text-2xl font-extrabold">English assessment</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Studies are written in English. You need two of the three questions right, plus a short writing sample.</p>
            {ENGLISH_QUESTIONS.map((q) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-medium">{q.prompt}</legend>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={q.id} required checked={answers[q.id] === opt} onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <label className="block text-sm font-medium">
              In a few sentences, describe a recent product or service you used and what you thought of it.
              <textarea
                required
                minLength={40}
                rows={5}
                value={writing}
                onChange={(e) => setWriting(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button disabled={pending} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
              Continue
            </button>
          </form>
        ) : null}

        {step === "identity" ? (
          <form
            className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            onSubmit={(e) => {
              e.preventDefault();
              void submit({ step: "identity", documentType, issuingCountry, consent: true });
            }}
          >
            <h1 className="text-2xl font-extrabold">Identity check</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              One person, one account. In production this would capture a live ID photo and selfie. This demo records the document type and approves you immediately so you can try studies and withdrawals.
            </p>
            <label className="block text-sm font-medium">
              Document type
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950">
                <option>Passport</option>
                <option>Driver licence</option>
                <option>National ID card</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Issuing country
              <input value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="block text-sm font-medium">
              ID photo (demo — any image)
              <input type="file" accept="image/*" className="mt-1.5 w-full text-sm" />
            </label>
            <label className="block text-sm font-medium">
              Selfie holding the ID (demo)
              <input type="file" accept="image/*" className="mt-1.5 w-full text-sm" />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              I consent to Opinly reviewing these documents to confirm I am one adult with one account.
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button disabled={pending || !consent} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">
              Submit for review
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
