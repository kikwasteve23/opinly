"use client";

import { useState } from "react";

export function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <li className="flex items-start justify-between gap-2">
      <span className="font-mono text-xs break-all">{text}</span>
      <button
        type="button"
        className="shrink-0 text-xs font-semibold text-indigo-700"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </li>
  );
}
