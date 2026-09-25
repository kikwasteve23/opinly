"use client";

import { useState } from "react";

export function CopyCaption({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <textarea
        readOnly
        rows={10}
        value={text}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm leading-relaxed dark:border-gray-800 dark:bg-gray-950"
      />
      <button
        type="button"
        className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy caption"}
      </button>
    </div>
  );
}
