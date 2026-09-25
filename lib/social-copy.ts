export function socialCaptions(joinUrl: string) {
  const instagram = `Get paid for an honest take.

Opinly is paid online research. Create a free account, tell us a bit about you, then take short studies in your browser. Every study shows the pay before you start.

Rewards are real USD — not points. When your available balance reaches $500, you can withdraw in crypto.

Join free:
${joinUrl}

#Opinly #PaidResearch #GetPaid`;

  const facebook = `How Opinly works (it is simpler than it looks)

1. Create a free account — we never charge a joining fee.
2. Tell us about you and complete a short English check so we can match you to studies you actually qualify for.
3. Take studies in your browser. Pay and time are shown up front.
4. Your rewards sit in USD. Withdraw in crypto once you have $500 available.

No gift cards. No points. Your name stays off the research.

Start here: ${joinUrl}`;

  const twitter = `Get paid for an honest take.

Opinly: free to join → take short studies in your browser (pay shown first) → real USD → withdraw crypto from $500.

Not points. Not a scheme to pay to start.

${joinUrl}`;

  const whatsapp = `Hey — I wanted to share Opinly.

It is paid online research. You join for free, answer short studies on your phone or computer, and the pay is shown before you start. It is real USD, and you withdraw in crypto once you hit $500 available.

Here is how to join:
${joinUrl}`;

  const linkedin = `Opinly is a paid online-research platform: people share honest opinions with researchers and get paid in real USD, withdrawn as crypto.

How it works
• Signing up is free. There is never a fee just to open an account.
• A short about-you profile and English check match you to studies you qualify for.
• Studies run in the browser. Reward and length are listed before you start.
• Withdrawals open from a $500 available balance, to a wallet you control.

If you have been looking for a straightforward way to take part in research — not points, not gift cards — this is the model.

${joinUrl}`;

  return [
    { id: "instagram", label: "Instagram / Threads", caption: instagram },
    { id: "facebook", label: "Facebook", caption: facebook },
    { id: "twitter", label: "X / Twitter", caption: twitter },
    { id: "whatsapp", label: "WhatsApp / Telegram", caption: whatsapp },
    { id: "linkedin", label: "LinkedIn", caption: linkedin },
  ];
}

export const SOCIAL_ASSETS = [
  {
    file: "opinly-ad-square.png",
    label: "Square post",
    use: "Instagram feed, Facebook, LinkedIn",
    size: "1:1",
  },
  {
    file: "opinly-ad-landscape.png",
    label: "Landscape post",
    use: "X, Facebook, YouTube, link previews",
    size: "16:9",
  },
  {
    file: "opinly-ad-story.png",
    label: "Story / Reel cover",
    use: "Instagram Stories, TikTok, WhatsApp status",
    size: "9:16",
  },
] as const;
