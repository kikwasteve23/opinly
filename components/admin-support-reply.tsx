"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyDepositChatAction, type AdminFormState } from "@/lib/admin-actions";

export function AdminSupportReply({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(replyDepositChatAction, null);
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (state?.ok && box.current) box.current.value = "";
  }, [state]);
  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <textarea ref={box} name="body" required rows={3} placeholder="Reply as staff…" className="w-full rounded-xl border px-3 py-2 text-sm" />
      <button disabled={pending} className="self-end rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Sending…" : "Send reply"}
      </button>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-indigo-700">{state.ok}</p> : null}
    </form>
  );
}
