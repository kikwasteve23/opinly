"use client";

import { useState } from "react";
import Link from "next/link";

export function RecoveryCodesPanel({
  codes,
  continueHref = "/onboarding",
  continueLabel = "I saved these codes — continue",
}: {
  codes: string[];
  continueHref?: string;
  continueLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const text = codes.join("\n");

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="text-xl font-extrabold">Save your emergency recovery codes</h2>
      <p className="mt-2 text-sm leading-relaxed">
        Copy these codes and keep them somewhere safe (notes app, password manager, or paper). Each code works once. If
        you forget your password, you will need one of these — we cannot email a reset link.
      </p>
      <ol className="mt-4 grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
        {codes.map((code) => (
          <li key={code} className="rounded-xl bg-white px-3 py-2 text-center font-semibold tracking-wide dark:bg-gray-950">
            {code}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy all codes"}
        </button>
        {saved ? (
          <Link href={continueHref} className="rounded-xl border border-amber-300 px-4 py-2.5 text-center text-sm font-semibold">
            {continueLabel}
          </Link>
        ) : (
          <span className="rounded-xl border border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800/70">
            Tick the box below to continue
          </span>
        )}
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        <span>I copied these codes and saved them somewhere I can find (notes, password manager, or paper).</span>
      </label>
    </div>
  );
}
