"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Question, Study } from "@/lib/types";
import { money } from "@/lib/utils";

type Payload = {
  study: Study & { kindLabel: string };
  submission: { id: string; status: string; answers: Record<string, string | string[]> } | null;
  canStart: boolean;
};

export function StudyRunner({ studyId }: { studyId: string }) {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void fetch(`/api/studies/${studyId}`)
      .then((r) => r.json())
      .then((payload: Payload) => {
        setData(payload);
        setAnswers(payload.submission?.answers ?? {});
      });
  }, [studyId]);

  async function save() {
    const res = await fetch(`/api/studies/${studyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (res.ok) setSaved("Progress saved.");
  }

  async function submit() {
    setError("");
    setPending(true);
    await save();
    const res = await fetch(`/api/studies/${studyId}/submit`, { method: "POST" });
    const json = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(json.error ?? "Could not submit.");
      return;
    }
    if (json.submission?.status === "rejected") {
      setError(json.submission.rejectionReason ?? "Submission rejected.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  if (!data) return <p className="text-sm text-gray-500">Loading study…</p>;
  if (!data.canStart) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold">Identity check still in review</p>
        <p className="mt-2 text-sm">You can look around, but you cannot start a study until verification clears.</p>
        <Link href="/onboarding" className="mt-4 inline-block text-sm font-semibold text-indigo-700">
          Finish onboarding
        </Link>
      </div>
    );
  }
  if (data.submission && data.submission.status !== "in_progress") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="font-semibold">This study is {data.submission.status.replace("_", " ")}.</p>
        <Link href="/app" className="mt-4 inline-block text-sm font-semibold text-indigo-700">
          Back to studies
        </Link>
      </div>
    );
  }

  const study = data.study;

  return (
    <div>
      <Link href="/app" className="text-sm font-semibold text-indigo-700">
        ← Studies
      </Link>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{study.kindLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold">{study.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">{study.summary}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 px-4 py-2 text-right dark:bg-indigo-950">
          <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{money(study.reward)}</p>
          <p className="text-xs text-gray-500">About {study.minutes} min</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {study.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            value={answers[question.id]}
            onChange={(value) => setAnswers((a) => ({ ...a, [question.id]: value }))}
          />
        ))}
      </div>
      {saved ? <p className="mt-4 text-sm text-gray-500">{saved}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => void save()} className="rounded-xl border border-gray-300 px-5 py-3 font-semibold">
          Save progress
        </button>
        <button disabled={pending} onClick={() => void submit()} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
          Submit for review
        </button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  onChange,
}: {
  question: Question;
  index: number;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <legend className="font-semibold">
        {index + 1}. {question.prompt}
      </legend>
      {question.type === "text" || (question.type === "attention" && !question.options) ? (
        <textarea
          className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
          rows={4}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : question.type === "multi" ? (
        <div className="mt-3 space-y-2">
          {question.options?.map((opt) => {
            const selected = Array.isArray(value) ? value.includes(opt) : false;
            return (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(selected ? current.filter((v) => v !== opt) : [...current, opt]);
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {question.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm">
              <input type="radio" name={question.id} checked={value === opt} onChange={() => onChange(opt)} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
