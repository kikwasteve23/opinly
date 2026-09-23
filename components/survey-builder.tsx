"use client";

import { useActionState, useEffect, useState } from "react";
import type { Study } from "@/lib/types";
import { generateSurveyAction, saveSurveyAction, type AdminFormState, type GenerateSurveyState } from "@/lib/admin-actions";

const emptyQuestions = JSON.stringify(
  [
    {
      id: "q1",
      type: "single",
      prompt: "What is your first answer?",
      options: ["A", "B", "C"],
      required: true,
    },
    {
      id: "attn1",
      type: "attention",
      prompt: "Select “I am paying attention”.",
      options: ["Skip", "I am paying attention"],
      correct: "I am paying attention",
      required: true,
    },
    {
      id: "q2",
      type: "text",
      prompt: "Tell us a bit more in your own words.",
      required: true,
    },
  ],
  null,
  2,
);

export function SurveyBuilder({ initial }: { initial?: Study }) {
  const [saveState, saveAction, saving] = useActionState<AdminFormState, FormData>(saveSurveyAction, null);
  const [genState, genAction, generating] = useActionState<GenerateSurveyState, FormData>(generateSurveyAction, null);
  const draft = genState?.draft ?? initial;
  const [questions, setQuestions] = useState(initial ? JSON.stringify(initial.questions, null, 2) : emptyQuestions);

  useEffect(() => {
    if (draft?.questions) setQuestions(JSON.stringify(draft.questions, null, 2));
  }, [draft]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={genAction} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Create with AI</h2>
        <p className="text-sm text-gray-500">
          Describe the research brief. If <code>OPENAI_API_KEY</code> is set on Render, we call the model; otherwise a built-in writer drafts the survey.
        </p>
        <label className="block text-sm">
          Topic
          <textarea name="topic" required rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="How people choose a grocery delivery app" />
        </label>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <label>
            Questions
            <input name="questionCount" type="number" defaultValue={5} min={3} max={10} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label>
            Reward $
            <input name="reward" type="number" step="0.25" defaultValue={5} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label>
            Minutes
            <input name="minutes" type="number" defaultValue={8} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm">
          Kind
          <select name="kind" defaultValue="survey" className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="survey">Survey</option>
            <option value="usability">Usability</option>
            <option value="short_poll">Short poll</option>
            <option value="multi_day">Multi-day</option>
          </select>
        </label>
        {genState?.error ? <p className="text-sm text-red-600">{genState.error}</p> : null}
        {genState?.ok ? <p className="text-sm text-indigo-700">{genState.ok}</p> : null}
        <button disabled={generating} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {generating ? "Writing…" : "Generate draft"}
        </button>
      </form>

      <form key={draft?.id ?? initial?.id ?? "new"} action={saveAction} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Review and publish</h2>
        <input type="hidden" name="id" value={draft?.id ?? initial?.id ?? ""} />
        <label className="block text-sm">
          Title
          <input name="title" required defaultValue={draft?.title ?? initial?.title ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Summary
          <textarea name="summary" required rows={3} defaultValue={draft?.summary ?? initial?.summary ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            Reward $
            <input name="reward" type="number" step="0.25" defaultValue={draft?.reward ?? initial?.reward ?? 4} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label>
            Minutes
            <input name="minutes" type="number" defaultValue={draft?.minutes ?? initial?.minutes ?? 10} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            Kind
            <select name="kind" defaultValue={draft?.kind ?? initial?.kind ?? "survey"} className="mt-1 w-full rounded-lg border px-3 py-2">
              <option value="survey">Survey</option>
              <option value="usability">Usability</option>
              <option value="short_poll">Short poll</option>
              <option value="multi_day">Multi-day</option>
            </select>
          </label>
          <label>
            Unlock level
            <select name="tier" defaultValue={String(draft?.tier ?? initial?.tier ?? 1)} className="mt-1 w-full rounded-lg border px-3 py-2">
              <option value="1">Beginner · free starter</option>
              <option value="2">Bronze · 20 referrals</option>
              <option value="3">Gold · 50 referrals</option>
              <option value="4">Platinum · 100 referrals</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            Format
            <input name="format" defaultValue={draft?.format ?? initial?.format ?? "Survey"} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm">
          Device
          <input name="device" defaultValue={draft?.device ?? initial?.device ?? "Desktop or phone"} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={draft?.published ?? initial?.published ?? true} />
          Live for participants
        </label>
        <label className="block text-sm">
          Questions (JSON)
          <textarea
            name="questions"
            required
            rows={14}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"
          />
        </label>
        {saveState?.error ? <p className="text-sm text-red-600">{saveState.error}</p> : null}
        {saveState?.ok ? <p className="text-sm text-indigo-700">{saveState.ok}</p> : null}
        <button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save survey"}
        </button>
      </form>
    </div>
  );
}
