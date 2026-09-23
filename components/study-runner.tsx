"use client";

import { useState } from "react";
import Link from "next/link";
import type { Question, Study } from "@/lib/types";
import { money } from "@/lib/utils";
import { saveStudyAction, submitStudyAction } from "@/lib/wallet-actions";

export type StudyPayload = {
  study: Study & { kindLabel: string };
  submission: { id: string; status: string; answers: Record<string, string | string[]> } | null;
  canStart: boolean;
  lockReason?: string | null;
};

export function StudyRunner({ studyId, initial }: { studyId: string; initial: StudyPayload }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initial.submission?.answers ?? {});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);

  async function save() {
    await saveStudyAction(studyId, answers);
    setSaved("Progress saved.");
  }

  async function submit() {
    setError("");
    setPending(true);
    const result = await submitStudyAction(studyId, answers);
    setPending(false);
    if (result?.error) setError(result.error);
  }

  if (!initial.canStart) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold">This study is locked</p>
        <p className="mt-2 text-sm">{initial.lockReason ?? "You can look around, but you cannot start this study yet."}</p>
        <Link href="/onboarding" className="mt-4 inline-block text-sm font-semibold text-indigo-700">
          Finish onboarding
        </Link>
      </div>
    );
  }
  if (initial.submission && initial.submission.status !== "in_progress") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="font-semibold">This study is {initial.submission.status.replace("_", " ")}.</p>
        <Link href="/app" className="mt-4 inline-block text-sm font-semibold text-indigo-700">
          Back to studies
        </Link>
      </div>
    );
  }

  const study = initial.study;

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
          <p className="text-xs text-gray-500">
            {study.questions.length} {study.questions.length === 1 ? "question" : "questions"} · About {study.minutes} min
          </p>
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
        <button type="button" onClick={() => void save()} className="rounded-xl border border-gray-300 px-5 py-3 font-semibold">
          Save progress
        </button>
        <button type="button" disabled={pending} onClick={() => void submit()} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
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
