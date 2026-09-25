"use client";

import { useState } from "react";
import { issueRecoveryCodesAction } from "@/lib/auth-actions";
import { RecoveryCodesPanel } from "@/components/recovery-codes-panel";

export function RecoveryCodesSettings({ remaining }: { remaining: number }) {
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function issue() {
    setError("");
    setPending(true);
    const result = await issueRecoveryCodesAction();
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setCodes(result?.codes ?? []);
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold">Emergency recovery codes</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        You have {remaining} unused code{remaining === 1 ? "" : "s"} left. Issuing a new set replaces the old ones.
        Copy them somewhere safe — this is how you reset a lost password.
      </p>
      {codes ? <div className="mt-4"><RecoveryCodesPanel codes={codes} continueHref="/app/profile" continueLabel="Done" /></div> : null}
      <button type="button" disabled={pending} onClick={() => void issue()} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Creating…" : "Issue new codes"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
