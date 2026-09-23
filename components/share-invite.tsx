"use client";

import { useState } from "react";

export function ShareInvite({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }
  const encoded = encodeURIComponent(message);
  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm font-medium">Share this message with your link</p>
      <textarea readOnly rows={4} value={message} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          {copied ? "Copied" : "Copy message"}
        </button>
        <a
          className="rounded-xl border px-4 py-2 text-sm font-semibold"
          href={`https://wa.me/?text=${encoded}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <a className="rounded-xl border px-4 py-2 text-sm font-semibold" href={`https://t.me/share/url?text=${encoded}`} target="_blank" rel="noreferrer">
          Telegram
        </a>
      </div>
    </div>
  );
}
