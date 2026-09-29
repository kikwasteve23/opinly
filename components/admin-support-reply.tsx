"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteChatShortcutAction,
  replyDepositChatAction,
  saveChatShortcutAction,
  type AdminFormState,
} from "@/lib/admin-actions";
import { shortcutPreview } from "@/lib/chat-shortcuts";
import type { ChatShortcut } from "@/lib/types";

export function AdminSupportReply({ userId, shortcuts }: { userId: string; shortcuts: ChatShortcut[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(replyDepositChatAction, null);
  const [saveState, saveAction, saving] = useActionState<AdminFormState, FormData>(saveChatShortcutAction, null);
  const box = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [savingOpen, setSavingOpen] = useState(false);

  useEffect(() => {
    if (state?.ok && box.current) {
      box.current.value = "";
      setDraft("");
    }
  }, [state]);

  useEffect(() => {
    if (saveState?.ok) {
      setSavingOpen(false);
      setTitle("");
    }
  }, [saveState]);

  return (
    <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      {shortcuts.length > 0 ? (
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {shortcuts.map((sc) => (
            <button
              key={sc.id}
              type="button"
              title={sc.body}
              onClick={() => {
                setDraft(sc.body);
                if (box.current) box.current.value = sc.body;
              }}
              className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
            >
              {sc.title}
            </button>
          ))}
        </div>
      ) : null}
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="userId" value={userId} />
        <textarea
          ref={box}
          name="body"
          required
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a reply…"
          className="w-full rounded-2xl border px-3 py-2 text-sm dark:bg-gray-950"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="text-xs font-semibold text-indigo-700"
            onClick={() => setSavingOpen((v) => !v)}
          >
            {savingOpen ? "Cancel save" : "Save as shortcut"}
          </button>
          <button disabled={pending} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state?.ok ? <p className="text-sm text-indigo-700">{state.ok}</p> : null}
      </form>
      {savingOpen ? (
        <form action={saveAction} className="mt-3 space-y-2 rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-950">
          <p className="font-semibold">Save a shortcut</p>
          <input type="hidden" name="body" value={draft} />
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name, e.g. Pay-to details"
            className="w-full rounded-lg border px-3 py-2"
          />
          <p className="text-xs text-gray-500">{draft ? shortcutPreview(draft, 80) : "Type a reply above first, then save it."}</p>
          {saveState?.error ? <p className="text-xs text-red-600">{saveState.error}</p> : null}
          {saveState?.ok ? <p className="text-xs text-indigo-700">{saveState.ok}</p> : null}
          <button disabled={saving || draft.trim().length < 2} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save shortcut"}
          </button>
        </form>
      ) : null}
      {shortcuts.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          {shortcuts.map((sc) => (
            <li key={`del-${sc.id}`} className="flex items-center justify-between gap-2">
              <span className="truncate">
                {sc.title} — {shortcutPreview(sc.body, 36)}
              </span>
              <form action={deleteChatShortcutAction}>
                <input type="hidden" name="id" value={sc.id} />
                <button className="text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
