export type LoungeRole = "member" | "admin";

export type LoungePersona = {
  id: string;
  name: string;
  city: string;
  color: string;
  role: LoungeRole;
};

export const LOUNGE_ADMIN: LoungePersona = {
  id: "ada",
  name: "Ada",
  city: "Opinly staff",
  color: "bg-indigo-700",
  role: "admin",
};

export const LOUNGE_MEMBERS: LoungePersona[] = [
  { id: "maya", name: "Maya", city: "Nairobi", color: "bg-violet-500", role: "member" },
  { id: "luis", name: "Luis", city: "Manila", color: "bg-sky-500", role: "member" },
  { id: "amina", name: "Amina", city: "Lagos", color: "bg-amber-500", role: "member" },
  { id: "theo", name: "Theo", city: "Cape Town", color: "bg-emerald-500", role: "member" },
  { id: "priya", name: "Priya", city: "Mumbai", color: "bg-rose-500", role: "member" },
  { id: "noah", name: "Noah", city: "Accra", color: "bg-indigo-500", role: "member" },
  { id: "lila", name: "Lila", city: "Jakarta", color: "bg-fuchsia-500", role: "member" },
  { id: "ken", name: "Ken", city: "Kisumu", color: "bg-teal-500", role: "member" },
];

export const LOUNGE_PERSONAS: LoungePersona[] = [LOUNGE_ADMIN, ...LOUNGE_MEMBERS];

export type LoungePost = { speaker: string; text: string };

export type LoungeThread = {
  id: string;
  question: LoungePost;
  /** Who should answer: staff or another member. */
  answerer: "admin" | "peer";
  answers: LoungePost[];
};

const CHATTER: LoungePost[] = [
  { speaker: "maya", text: "Just wrapped a short one on my lunch break. Pay was sitting there before I even tapped start." },
  { speaker: "luis", text: "Finished work going to History is such a small thing but my dashboard finally looks calm." },
  { speaker: "amina", text: "Nobody asked me to pay to join. That still surprises me." },
  { speaker: "theo", text: "My cousin finished her first study last night. She sent me a voice note laughing about it." },
  { speaker: "priya", text: "Researchers never get my name. I keep repeating that to my sister so she stops worrying." },
  { speaker: "noah", text: "Pending just means they are reading the answers. Mine moved over this morning." },
  { speaker: "lila", text: "Kettle on, phone out, five questions. That is the whole evening for me lately." },
  { speaker: "ken", text: "Seeing local pay next to USD made it feel real, not like points." },
  { speaker: "maya", text: "I treat it as extra money. A few careful studies beat rushing junk ones." },
  { speaker: "luis", text: "Matching happens before I waste ten minutes. I used to screenshot every screen-out. Stopped that." },
  { speaker: "amina", text: "I used to doomscroll. Now I answer things that actually go into research. Mood is better." },
  { speaker: "theo", text: "Mum asked why I was quieter after dinner. Told her I was on studies. She wants the link." },
];

export const LOUNGE_THREADS: LoungeThread[] = [
  {
    id: "join-fee",
    question: { speaker: "ken", text: "Quick one — do I pay anything to create the account?" },
    answerer: "admin",
    answers: [
      { speaker: "ada", text: "No. Signing up is free. Opinly staff will never ask you to pay just to open an account." },
      { speaker: "maya", text: "If someone DMs you a joining fee, it is not us. Report it." },
    ],
  },
  {
    id: "pending",
    question: { speaker: "lila", text: "My balance is in pending. Did I do something wrong?" },
    answerer: "peer",
    answers: [
      { speaker: "noah", text: "Same thing happened to me. Pending means they are reviewing your responses. It moved after that." },
      { speaker: "ada", text: "That is right. We read the answers first, then it goes to available. Nothing for you to chase." },
    ],
  },
  {
    id: "devices",
    question: { speaker: "priya", text: "Can I do these on my phone or do I need a laptop?" },
    answerer: "peer",
    answers: [
      { speaker: "luis", text: "Phone is fine. I do the short ones on the commute." },
      { speaker: "amina", text: "Laptop too. Same studies either way." },
    ],
  },
  {
    id: "id-docs",
    question: { speaker: "theo", text: "Do I have to upload an ID before I start studies?" },
    answerer: "admin",
    answers: [
      { speaker: "ada", text: "ID is optional. Finish About you and English, then you can take studies. You can add a document later from Profile." },
    ],
  },
  {
    id: "researchers",
    question: { speaker: "maya", text: "Who actually sees what I write in a study?" },
    answerer: "admin",
    answers: [
      { speaker: "ada", text: "Researchers see your answers and the demographics the study screened on. Not your name, email, or ID." },
      { speaker: "priya", text: "That is why I stayed. I was not going to put my full name next to a shopping diary." },
    ],
  },
  {
    id: "upgrade",
    question: { speaker: "noah", text: "Beginner studies disappeared for me. Is the account broken?" },
    answerer: "peer",
    answers: [
      { speaker: "ken", text: "You ran out of Beginner ones. Share your invite or hire a marketer to unlock the next level." },
      { speaker: "ada", text: "Higher-paying studies open after you upgrade. Referrals have to finish a survey to count." },
    ],
  },
  {
    id: "attention",
    question: { speaker: "amina", text: "I missed an attention check. Am I done here?" },
    answerer: "peer",
    answers: [
      { speaker: "theo", text: "I failed one too. Slowed down on the next study and it approved. Read every line." },
    ],
  },
  {
    id: "payout",
    question: { speaker: "luis", text: "When I cash out, is it gift cards or actual money?" },
    answerer: "admin",
    answers: [
      { speaker: "ada", text: "Withdrawals are crypto to a wallet you control. The $50 activation is added to your balance and goes out with your first withdrawal — it is not a fee we keep." },
    ],
  },
  {
    id: "english",
    question: { speaker: "lila", text: "How strict is the English step? I am nervous about the writing bit." },
    answerer: "peer",
    answers: [
      { speaker: "maya", text: "A few honest sentences were enough for me. Grammar questions are short." },
      { speaker: "ada", text: "We need to know you can follow a study in English. You do not need perfect prose." },
    ],
  },
  {
    id: "habit",
    question: { speaker: "ken", text: "Has this actually changed anything for you, or is it just extra cash?" },
    answerer: "peer",
    answers: [
      { speaker: "maya", text: "Both. Twenty quiet minutes after the kids sleep. Real studies, and I stopped scrolling junk." },
      { speaker: "amina", text: "Same. I feel like my evenings went somewhere useful." },
    ],
  },
];

export function personaById(id: string) {
  return LOUNGE_PERSONAS.find((p) => p.id === id) ?? LOUNGE_MEMBERS[0];
}

export function loungeGapMs(open: boolean, rng = Math.random) {
  if (open) return Math.round(3500 + rng() * 14000);
  return Math.round(9000 + rng() * 28000);
}

export function typingMs(text: string, rng = Math.random) {
  return Math.round(700 + Math.min(2200, text.length * 18) + rng() * 600);
}

export type LoungeEvent =
  | { kind: "chatter"; post: LoungePost }
  | { kind: "question"; thread: LoungeThread };

export function pickLoungeEvent(usedThreadIds: string[], rng = Math.random): LoungeEvent {
  const unused = LOUNGE_THREADS.filter((t) => !usedThreadIds.includes(t.id));
  const askQuestion = rng() < 0.55 && unused.length > 0;
  if (askQuestion) {
    return { kind: "question", thread: unused[Math.floor(rng() * unused.length)]! };
  }
  return { kind: "chatter", post: CHATTER[Math.floor(rng() * CHATTER.length)]! };
}

export function repliesForThread(thread: LoungeThread, rng = Math.random): LoungePost[] {
  const primary =
    thread.answerer === "admin"
      ? thread.answers.find((a) => a.speaker === LOUNGE_ADMIN.id) ?? thread.answers[0]
      : thread.answers.find((a) => a.speaker !== LOUNGE_ADMIN.id) ?? thread.answers[0];
  const extras = thread.answers.filter((a) => a !== primary);
  const out = [primary];
  if (extras.length && rng() < 0.55) out.push(extras[Math.floor(rng() * extras.length)]!);
  return out;
}

export function seedLoungePosts(now = Date.now()): { post: LoungePost; at: number }[] {
  const t = LOUNGE_THREADS[1]!;
  return [
    { post: CHATTER[0]!, at: now - 240_000 },
    { post: CHATTER[4]!, at: now - 190_000 },
    { post: t.question, at: now - 140_000 },
    { post: t.answers[0]!, at: now - 95_000 },
    { post: CHATTER[8]!, at: now - 50_000 },
  ];
}
