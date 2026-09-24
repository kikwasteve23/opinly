import { loungeCrowd, type LoungePersona, type LoungeRole } from "./lounge-people";

export type { LoungePersona, LoungeRole };

export const LOUNGE_ADMINS: LoungePersona[] = [
  { id: "ada", name: "Ada", city: "Opinly staff", color: "bg-indigo-700", role: "admin" },
  { id: "malik", name: "Malik", city: "Opinly staff", color: "bg-slate-700", role: "admin" },
];

export const LOUNGE_ADMIN = LOUNGE_ADMINS[0]!;
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

const CHATTER: string[] = [
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
  "Thanks Ada. That cleared it up.",
  "Malik just confirmed my pending study. Off to History it went.",
  "Did a 12-minute one while the rice cooked. That is my kind of evening.",
  "Invite went to my church group. Two people actually finished a study.",
  "I keep the tab open on mobile data. Short ones load fine.",
  "First withdrawal is still a way off for me. I am not rushing studies though.",
  "Ada said ID can wait. I started without uploading anything.",
  "Anyone else get the snack diary? Mine paid more than the opinion ones.",
  "I almost DMed someone who asked for a joining fee. Glad I checked here first.",
  "Gold studies showed up after I shared the link enough times. Slow but real.",
  "Typing on a cracked screen in a matatu. Still got the attention check.",
  "Pending sat overnight then moved. I stopped refreshing every five minutes.",
  "My sister in Cebu finished English in one sitting. She was overthinking it.",
  "Do not send crypto until staff posts the address in deposit chat. Learned that the loud way from a fake TG group.",
  "Lounge is quieter at my 3am. Morning crowd is nicer.",
  "I only take studies I actually qualify for. Screen-outs used to annoy me.",
  "Malik: withdrawals are crypto. I already had a TRC20 wallet so that was easy.",
  "Photo on Profile is just so I recognise my own account. Researchers never see it.",
  "Beginner list went empty and I thought the site broke. It is the upgrade pause.",
  "Told my uncle it is research, not a scheme. He still asked three times.",
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
    adminText: "Withdrawals are crypto to a wallet you control. Minimum cash-out is $500 available. You always see the fees before you confirm.",
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
    id: "deposit-chat",
    question: "Where do I send the $50? I do not want a fake account number.",
    answerer: "admin",
    adminText: "Open Deposit funds. If pay-to details are not printed, use deposit chat on that page. Staff will send the live account, paybill, or invoice. Never pay someone who DMs you.",
  },
  {
    id: "two-admins",
    question: "Who actually replies in here — is this a bot?",
    answerer: "admin",
    adminText: "We are here to help you. Real staff read this room and deposit chat — it is not an auto-message.",
  },
  {
    id: "members",
    question: "How many people are actually on this thing?",
    answerer: "peer",
    peerText: "Header shows the live count. Online stays in the hundreds whenever I open it.",
    adminText: "The member total ticks up as people finish onboarding. Online is whoever is in the product right now.",
  },
  {
    id: "crypto-net",
    question: "USDT on the wrong network — can you recover it?",
    answerer: "admin",
    adminText: "No. TRC20 only if that is what we posted. ERC20 or BSC to a TRON address is gone. Ask in deposit chat before you send.",
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
    post: { speaker: speaker.id, text: CHATTER[Math.floor(rng() * CHATTER.length)]! },
  };
}

export function repliesForThread(thread: LoungeThread, recentSpeakers: string[], rng = Math.random): LoungePost[] {
  const out: LoungePost[] = [];
  if (thread.answerer === "admin" || thread.adminText) {
    const admin = LOUNGE_ADMINS[Math.floor(rng() * LOUNGE_ADMINS.length)]!;
    if (thread.answerer === "admin") {
      out.push({ speaker: admin.id, text: thread.adminText ?? "A staff member will confirm that in deposit chat." });
      if (thread.peerText && rng() < 0.45) {
        out.push({ speaker: unusedMember([...recentSpeakers, admin.id], rng).id, text: thread.peerText });
      }
      return out;
    }
  }
  if (thread.peerText) {
    out.push({ speaker: unusedMember(recentSpeakers, rng).id, text: thread.peerText });
  }
  if (thread.adminText && rng() < 0.5) {
    const admin = LOUNGE_ADMINS[Math.floor(rng() * LOUNGE_ADMINS.length)]!;
    out.push({ speaker: admin.id, text: thread.adminText });
  }
  return out.length ? out : [{ speaker: unusedMember(recentSpeakers, rng).id, text: thread.peerText || thread.adminText || "Staff will confirm in deposit chat." }];
}

export function seedLoungePosts(): LoungePost[] {
  const a = LOUNGE_MEMBERS[3]!;
  const b = LOUNGE_MEMBERS[11]!;
  const c = LOUNGE_MEMBERS[22]!;
  return [
    { speaker: a.id, text: CHATTER[15]! },
    { speaker: b.id, text: CHATTER[0]! },
    { speaker: c.id, text: LOUNGE_THREADS[0]!.question },
    { speaker: "ada", text: LOUNGE_THREADS[0]!.adminText ?? "Signing up is free." },
    { speaker: LOUNGE_MEMBERS[40]!.id, text: CHATTER[8]! },
  ];
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
