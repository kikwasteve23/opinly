import type { ChatShortcut } from "./types";

export const DEFAULT_CHAT_SHORTCUTS: ChatShortcut[] = [
  {
    id: "sc_payto",
    title: "Pay-to details",
    body: "Here are the pay-to details for your transfer. Send the exact amount shown on your deposit page, then tap I have sent the payment.",
  },
  {
    id: "sc_received",
    title: "We see it",
    body: "We have your payment in the queue. An admin will match it shortly — keep this chat open if anything changes.",
  },
  {
    id: "sc_amount",
    title: "Exact amount",
    body: "Please send the exact USD amount shown on the deposit page. A different amount delays the match.",
  },
  {
    id: "sc_marketer",
    title: "Marketer hire",
    body: "Once this payment is matched, your marketer hire starts. Referrals land after the transfer is approved — not before.",
  },
  {
    id: "sc_wait",
    title: "Please wait",
    body: "Thanks for waiting. We reply in this thread only. Do not send money to anyone who messages you privately.",
  },
];

export function shortcutPreview(body: string, max = 48) {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}
