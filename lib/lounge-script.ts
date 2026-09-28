import { firstNameOf, loungeCrowd, loungeLabel, type LoungePersona, type LoungeRole } from "./lounge-people";

export type { LoungePersona, LoungeRole };
export { firstNameOf, loungeLabel };

export const LOUNGE_ADMINS: LoungePersona[] = [
  { id: "support", name: "Support", firstName: "Support", flag: "", country: "", color: "bg-indigo-700", role: "admin" },
];

export const LOUNGE_ADMIN = LOUNGE_ADMINS[0]!;
/** Public Telegram channel. Override with NEXT_PUBLIC_TELEGRAM_CHANNEL. */
export const TELEGRAM_CHANNEL_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL?.trim()) || "https://t.me/opinly";
export const LOUNGE_MEMBERS = loungeCrowd();
export const LOUNGE_PERSONAS: LoungePersona[] = [...LOUNGE_ADMINS, ...LOUNGE_MEMBERS];

export type LoungePost = { speaker: string; text: string };

export type LoungeThread = {
  id: string;
  question: string;
  answerer: "admin" | "peer";
  adminText?: string;
  peerText?: string;
};

export const LOUNGE_CHATTER: string[] = [
  "Just wrapped a short one on my lunch break. Pay was sitting there before I even tapped start.",
  "Finished work going to History is such a small thing but my dashboard finally looks calm.",
  "Nobody asked me to pay to join. That still surprises me.",
  "My cousin finished her first study last night. She sent me a voice note laughing about it.",
  "Researchers never get my name. I keep repeating that to my sister so she stops worrying.",
  "Pending just means they are reading the answers. Mine moved over this morning.",
  "Kettle on, phone out, five questions. That is the whole evening for me lately.",
  "Seeing local pay next to USD made it feel real, not like points.",
  "I treat it as extra money. A few careful studies beat rushing junk ones.",
  "Matching happens before I waste ten minutes. I used to screenshot every screen-out. Stopped that.",
  "I used to doomscroll. Now I answer things that actually go into research. Mood is better.",
  "Mum asked why I was quieter after dinner. Told her I was doing studies. She wants the link.",
  "Profile photo is just for the account. Researchers still do not see it.",
  "The English writing sample was a few honest sentences. That was enough.",
  "Sharing my invite in the family WhatsApp felt natural once I had actually been paid.",
  "Hi everyone. First study done. This is nicer than I expected.",
  "gm. One study before work then I am out.",
  "Thanks Support. That cleared it up.",
  "Support just confirmed my pending study. Off to History it went.",
  "Did a 12-minute one while the rice cooked. That is my kind of evening.",
  "Invite went to my church group. Two people actually finished a study.",
  "I keep the tab open on mobile data. Short ones load fine.",
  "First withdrawal is still a way off for me. I am not rushing studies though.",
  "Support said ID can wait. I started without uploading anything.",
  "Anyone else get the snack diary? Mine paid more than the opinion ones.",
  "I almost DMed someone who asked for a joining fee. Glad I checked here first.",
  "Gold studies showed up after I shared the link enough times. Slow but real.",
  "Typing on a cracked screen in a matatu. Still got the attention check.",
  "Pending sat overnight then moved. I stopped refreshing every five minutes.",
  "My sister in Cebu finished English in one sitting. She was overthinking it.",
  "I keep the tab open on mobile data. Short ones load fine.",
  "Lounge is quieter at my 3am. Morning crowd is nicer.",
  "I only take studies I actually qualify for. Screen-outs used to annoy me.",
  "Support: withdrawals are crypto. I already had a TRC20 wallet so that was easy.",
  "Photo on Profile is just so I recognise my own account. Researchers never see it.",
  "Beginner list went empty and I thought the site broke. It is the upgrade pause.",
  "Told my uncle it is research, not a scheme. He still asked three times.",
  "Rainy afternoon, two polls, then I went back to cooking. Easy.",
  "Someone in my building asked if this is a game. I said it is research. She signed up anyway.",
  "I like that skip exists. If the topic is not me, I just leave it.",
  "Night shift ended, did one survey in the locker room. Weirdly peaceful.",
  "My first approved one showed up in History this morning. I actually smiled at my phone.",
  "Support answered me in here yesterday. Short and clear. That is all I needed.",
  "Taking a study in English is fine. I just read twice before I tap.",
  "The short polls are my favourite. In and out before the kettle boils.",
  "I told a coworker and they thought it was a raffle. It is not. You get paid for answers.",
  "Closed the app last night mid-study. Came back, it remembered where I was.",
  "Got a usability one about a grocery app. Felt like I was helping, not filling boxes.",
  "Opened Wallet, pasted my own TRC20 address, requested $500. It only goes to that wallet — nobody else’s.",
  "Minimum withdrawal is $500 available. I am still climbing. Not rushing junk studies for it.",
  "I almost used a BEP20 USDT address. Friend said no — has to be TRC20, starts with T. That would have been gone.",
  "First cash-out sat on processing, then sent. Landed in the Trust Wallet I control the same evening.",
  "Picked Litecoin once because the network fee was tiny. Arrived in my LTC wallet, not a bank app.",
  "Someone asked me to withdraw to their address. I said no. Support: it only sends to the wallet on your account.",
  "The quote showed the 5% and the network fee before I confirmed. No surprise on the amount that arrived.",
  "Saved the receive address on Wallet and left it. Changing it later holds payouts, so I double-checked first.",
  "USDT on TRON is what most people here use. I sent a tiny test from another app to that T-address before my first cash-out.",
  "Network was slow one night. Support said wait it out. It showed sent and the crypto showed up in my wallet.",
  "Gas on TRC20 was about a dollar. I still had to be at $500 available before the button even worked.",
  "I keep USDT in the same wallet I withdraw to. No middleman, no cash pickup, just the address I pasted.",
  "Wrong chain cannot be recovered. I read that twice. Now I screenshot the network name before I tap confirm.",
];

export const LOUNGE_THREADS: LoungeThread[] = [
  {
    id: "join-fee",
    question: "Quick one — do I pay anything to create the account?",
    answerer: "admin",
    adminText: "No. Signing up is free. Opinly staff will never ask you to pay just to open an account.",
    peerText: "If someone DMs you a joining fee, it is not us. Report it.",
  },
  {
    id: "pending",
    question: "My balance is in pending. Did I do something wrong?",
    answerer: "peer",
    peerText: "Same thing happened to me. Pending means they are reviewing your responses. It moved after that.",
    adminText: "That is right. We read the answers first, then it goes to available. Nothing for you to chase.",
  },
  {
    id: "devices",
    question: "Can I do these on my phone or do I need a laptop?",
    answerer: "peer",
    peerText: "Phone is fine. I do the short ones on the commute. Laptop works too — same studies.",
  },
  {
    id: "id-docs",
    question: "Do I have to upload an ID before I start studies?",
    answerer: "admin",
    adminText: "ID is optional. Finish About you and English, then you can take studies. You can add a document later from Profile.",
  },
  {
    id: "researchers",
    question: "Who actually sees what I write in a study?",
    answerer: "admin",
    adminText: "Researchers see your answers and the demographics the study screened on. Not your name, email, or ID.",
    peerText: "That is why I stayed. I was not going to put my full name next to a shopping diary.",
  },
  {
    id: "upgrade",
    question: "Beginner studies disappeared for me. Is the account broken?",
    answerer: "peer",
    peerText: "You ran out of Beginner ones. Share your invite or hire a marketer to unlock the next level.",
    adminText: "Higher-paying studies open after you upgrade. Referrals have to finish a survey to count.",
  },
  {
    id: "attention",
    question: "I missed an attention check. Am I done here?",
    answerer: "peer",
    peerText: "Refresh and start that survey over. It is not the end — just read every line the second time.",
    adminText: "That is right. A missed attention check asks you to refresh and begin again. It does not close your account.",
  },
  {
    id: "payout",
    question: "When I cash out, is it gift cards or actual money?",
    answerer: "admin",
    adminText:
      "Crypto only, to a wallet you control. Open Wallet, pick USDT (TRC20) or Litecoin, paste your receive address, and request at least $500. You see the fees before you confirm.",
    peerText: "It showed up in my own Trust Wallet. Not a bank, not someone else’s address.",
  },
  {
    id: "how-withdraw",
    question: "Walk me through a withdrawal. I have never done crypto before.",
    answerer: "admin",
    adminText:
      "Install a wallet that supports the network. For USDT use a TRC20 address starting with T. For Litecoin, L, M, or ltc1. Save that address on Wallet, enter $500 or more, confirm. We send to that address only.",
    peerText:
      "I used Trust Wallet, copied the TRC20 receive address, and double-checked the T at the front. First one took a few hours in processing, then it was in my wallet.",
  },
  {
    id: "min-withdraw",
    question: "What is the minimum I can actually withdraw?",
    answerer: "admin",
    adminText: "Available balance has to reach $500 before you can request a cash-out. Smaller amounts stay in Wallet until then.",
    peerText: "I waited until I cleared $500. The button did nothing before that.",
  },
  {
    id: "own-wallet",
    question: "Can you send my withdrawal to my cousin’s wallet? I do not have one yet.",
    answerer: "admin",
    adminText:
      "No. Withdrawals only go to the crypto address saved on your own account. Make a wallet you control, paste that address, and we send there. We will not pay a third party.",
    peerText: "Someone asked me to use their address too. I made my own. Glad I did.",
  },
  {
    id: "wrong-network",
    question: "I almost pasted a BSC USDT address. Would that have arrived?",
    answerer: "peer",
    peerText:
      "Same scare here. Support said wrong network cannot be recovered. I switched to TRC20 and sent a $1 test to that T-address from another app first.",
    adminText: "Use the network you picked on Wallet. USDT is TRC20 only. Litecoin is Litecoin. A mismatch does not bounce back.",
  },
  {
    id: "withdraw-stuck",
    question: "My withdrawal still says processing. Did I lose it?",
    answerer: "peer",
    peerText:
      "Mine sat there a while then flipped to sent. The USDT showed up in the wallet I saved. I stopped refreshing every minute.",
    adminText: "Processing means an admin is sending it to your saved address. When it is sent, check that same wallet. Status lives under Recent withdrawals.",
  },
  {
    id: "trc20-or-ltc",
    question: "USDT or Litecoin — which do people actually use?",
    answerer: "peer",
    peerText: "Most folks here use USDT on TRON. I used Litecoin once because the network fee was smaller. Both went to wallets I own.",
    adminText: "Either is fine. Pick the network your wallet supports, paste that receive address, and we send only there.",
  },
  {
    id: "fees-quote",
    question: "Do fees come off after I confirm, or do I see them first?",
    answerer: "admin",
    adminText: "You see the 5% platform fee and the network fee on Wallet before you confirm. The amount that arrives is the quote, sent to your wallet.",
    peerText: "The number that landed matched the quote. No extra cut later.",
  },
  {
    id: "english",
    question: "How strict is the English step? I am nervous about the writing bit.",
    answerer: "peer",
    peerText: "A few honest sentences were enough for me. Grammar questions are short.",
    adminText: "We need to know you can follow a study in English. You do not need perfect prose.",
  },
  {
    id: "habit",
    question: "Has this actually changed anything for you, or is it just extra cash?",
    answerer: "peer",
    peerText: "Both. Twenty quiet minutes after the kids sleep. Real studies, and I stopped scrolling junk.",
  },
  {
    id: "photo",
    question: "Is the profile picture shown to researchers?",
    answerer: "admin",
    adminText: "No. The photo is only on your Opinly account. Researchers never see it.",
  },
  {
    id: "wait",
    question: "How long does a review usually take?",
    answerer: "admin",
    adminText: "We review responses in the background. Most approved studies move from pending to available the same day.",
  },
  {
    id: "two-admins",
    question: "Who actually replies in here — is this a bot?",
    answerer: "admin",
    adminText: "This is Support. A real person reads the lounge — it is not an auto-message.",
  },
  {
    id: "members",
    question: "How many people are actually on this thing?",
    answerer: "peer",
    peerText: "Header shows the live count. Online stays in the hundreds whenever I open it.",
    adminText: "The member total ticks up as people finish onboarding. Online is whoever is in the product right now.",
  },
  {
    id: "levels",
    question: "Will I still see Bronze studies if they are locked?",
    answerer: "admin",
    adminText: "Yes. Each level shows that level’s studies, locked or unlocked, so you can see what you are working toward.",
  },
];

export function personaById(id: string) {
  return LOUNGE_PERSONAS.find((p) => p.id === id) ?? LOUNGE_MEMBERS[0]!;
}

export function loungeGapMs(rng = Math.random) {
  return Math.round(10_000 + rng() * 80_000);
}

/** Typing wait: short greetings stay brief; long answers take 30–120s. */
export function typingMs(text: string, rng = Math.random) {
  const n = text.trim().length;
  if (n <= 40) return Math.round(2_000 + rng() * 6_000);
  if (n <= 110) return Math.round(8_000 + rng() * 18_000);
  return Math.round(30_000 + rng() * 90_000);
}

export type LoungeEvent =
  | { kind: "chatter"; post: LoungePost }
  | { kind: "question"; thread: LoungeThread; asker: string };

function unusedMember(recent: string[], rng: () => number) {
  const pool = LOUNGE_MEMBERS.filter((p) => !recent.includes(p.id));
  const pickFrom = pool.length > 8 ? pool : LOUNGE_MEMBERS;
  return pickFrom[Math.floor(rng() * pickFrom.length)]!;
}

export function pickLoungeEvent(usedThreadIds: string[], recentSpeakers: string[], rng = Math.random): LoungeEvent {
  const unused = LOUNGE_THREADS.filter((t) => !usedThreadIds.includes(t.id));
  const askQuestion = rng() < 0.48 && unused.length > 0;
  const speaker = unusedMember(recentSpeakers, rng);
  if (askQuestion) {
    return { kind: "question", thread: unused[Math.floor(rng() * unused.length)]!, asker: speaker.id };
  }
  return {
    kind: "chatter",
    post: { speaker: speaker.id, text: LOUNGE_CHATTER[Math.floor(rng() * LOUNGE_CHATTER.length)]! },
  };
}

export function repliesForThread(thread: LoungeThread, recentSpeakers: string[], rng = Math.random): LoungePost[] {
  const out: LoungePost[] = [];
  if (thread.answerer === "admin") {
    out.push({ speaker: LOUNGE_ADMIN.id, text: thread.adminText ?? "Support will follow up here." });
    if (thread.peerText && rng() < 0.45) {
      out.push({ speaker: unusedMember([...recentSpeakers, LOUNGE_ADMIN.id], rng).id, text: thread.peerText });
    }
    return out;
  }
  if (thread.peerText) {
    out.push({ speaker: unusedMember(recentSpeakers, rng).id, text: thread.peerText });
  }
  if (thread.adminText && rng() < 0.5) {
    out.push({ speaker: LOUNGE_ADMIN.id, text: thread.adminText });
  }
  return out.length
    ? out
    : [{ speaker: unusedMember(recentSpeakers, rng).id, text: thread.peerText || thread.adminText || "Support will follow up here." }];
}

export function seedLoungePosts(rng = Math.random): LoungePost[] {
  const count = 5 + Math.floor(rng() * 4);
  const posts: LoungePost[] = [];
  const usedSpeakers: string[] = [];
  const usedChatter = new Set<number>();
  const usedThreads = new Set<string>();

  const nextMember = () => {
    const person = unusedMember(usedSpeakers, rng);
    usedSpeakers.push(person.id);
    return person;
  };

  const nextChatter = () => {
    let idx = Math.floor(rng() * LOUNGE_CHATTER.length);
    let guard = 0;
    while (usedChatter.has(idx) && guard < LOUNGE_CHATTER.length) {
      idx = (idx + 1) % LOUNGE_CHATTER.length;
      guard += 1;
    }
    usedChatter.add(idx);
    return LOUNGE_CHATTER[idx]!;
  };

  while (posts.length < count) {
    if (rng() < 0.28 && usedThreads.size < LOUNGE_THREADS.length) {
      const unused = LOUNGE_THREADS.filter((t) => !usedThreads.has(t.id));
      const thread = unused[Math.floor(rng() * unused.length)]!;
      usedThreads.add(thread.id);
      posts.push({ speaker: nextMember().id, text: thread.question });
      for (const reply of repliesForThread(thread, usedSpeakers, rng).slice(0, 2)) {
        usedSpeakers.push(reply.speaker);
        posts.push(reply);
        if (posts.length >= count) break;
      }
      continue;
    }
    posts.push({ speaker: nextMember().id, text: nextChatter() });
  }
  return posts.slice(0, count);
}

/** Total members crawl upward from a base above 10,000. Online stays above 200. */
export function loungeCensus(now = Date.now()) {
  const start = Date.parse("2026-08-01T00:00:00.000Z");
  const hours = Math.max(0, (now - start) / 3_600_000);
  const total = 11_247 + Math.floor(hours * 2.4);
  const wave = Math.sin(now / 190_000);
  const online = Math.floor(208 + ((wave + 1) / 2) * 72 + ((now / 11_000) % 28));
  return { total, online: Math.max(201, online) };
}

export function formatCount(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
