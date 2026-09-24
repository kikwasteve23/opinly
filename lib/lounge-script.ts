export type LoungePersona = {
  id: string;
  name: string;
  city: string;
  color: string;
};

export const LOUNGE_PERSONAS: LoungePersona[] = [
  { id: "maya", name: "Maya", city: "Nairobi", color: "bg-violet-500" },
  { id: "luis", name: "Luis", city: "Manila", color: "bg-sky-500" },
  { id: "amina", name: "Amina", city: "Lagos", color: "bg-amber-500" },
  { id: "theo", name: "Theo", city: "Cape Town", color: "bg-emerald-500" },
  { id: "priya", name: "Priya", city: "Mumbai", color: "bg-rose-500" },
  { id: "noah", name: "Noah", city: "Accra", color: "bg-indigo-500" },
  { id: "lila", name: "Lila", city: "Jakarta", color: "bg-fuchsia-500" },
  { id: "ken", name: "Ken", city: "Kisumu", color: "bg-teal-500" },
];

/** Scripted lounge talk: Opinly only — benefits and how it has helped people. */
export const LOUNGE_LINES: { speaker: string; text: string }[] = [
  { speaker: "maya", text: "I used to bounce between random survey sites. Opinly is the first one that actually shows the pay before I start." },
  { speaker: "luis", text: "Same. I finished two studies on my lunch break and the dashboard stayed tidy. Finished work sits in History." },
  { speaker: "amina", text: "The English check felt fair. After that, studies just appeared. No one asked me to pay to join." },
  { speaker: "theo", text: "My cousin joined from my invite. Helping her through the first survey felt better than nagging her about a side hustle." },
  { speaker: "priya", text: "I like that researchers never see my name or email. They get the answers, I keep my identity." },
  { speaker: "noah", text: "Pending just means they are reviewing responses. Mine moved over once the review finished." },
  { speaker: "lila", text: "Phone or laptop, same studies. I do the short ones while the kettle boils." },
  { speaker: "ken", text: "The local pay next to USD made it click for me. I could see what it meant at home." },
  { speaker: "maya", text: "Beginner studies ran out for me, so I shared my link. Upgrading is how you unlock the higher-paying ones." },
  { speaker: "luis", text: "I hired a marketer when I did not want to chase invites myself. Slots filled and I was back on studies." },
  { speaker: "amina", text: "Honest answers last. The attention checks are simple if you actually read the question." },
  { speaker: "theo", text: "I treat it as extra money, not a wage, and I am not disappointed. A few careful studies beat rushing ten junk ones." },
  { speaker: "priya", text: "Profile picture is just for the account. Researchers still do not see it." },
  { speaker: "noah", text: "ID can wait. I started studies after About you and English. I added the document later." },
  { speaker: "lila", text: "When my sister got approved, we sat in this lounge and compared which studies we both qualified for. Felt like a small club." },
  { speaker: "ken", text: "Support on the deposit desk actually replied. I was not shouting into a void." },
  { speaker: "maya", text: "The biggest change for me is the habit. Twenty quiet minutes after the kids sleep, real studies, real balance." },
  { speaker: "luis", text: "I stopped screenshotting every screen-out. Matching happens before I spend ten minutes on a study I cannot finish." },
  { speaker: "amina", text: "Telling people the invite is free to join is easy. Nobody has to buy a starter pack." },
  { speaker: "theo", text: "Crypto payout is what I wanted. I already had a wallet. The steps on Wallet are plain." },
  { speaker: "priya", text: "I used to feel guilty taking surveys at work. Opinly studies are short enough that I do them on the commute instead." },
  { speaker: "noah", text: "My English writing sample was just a few honest sentences. That was enough to get in." },
  { speaker: "lila", text: "History is underrated. I can see what I already finished without it clogging Studies." },
  { speaker: "ken", text: "Sharing the link in our church group felt natural because I had already been paid for work I did." },
  { speaker: "maya", text: "I like that the platform never asks for a joining fee. If someone DMs you asking for one, it is not Opinly." },
  { speaker: "luis", text: "Bronze studies pay more, but you earn the track with people who actually finish a survey. That keeps it honest." },
  { speaker: "amina", text: "Positive effect for me: I stopped doomscrolling and started answering things that go into real research." },
  { speaker: "theo", text: "My mum asked why I was quieter in the evenings. I told her I was doing studies. She asked for the link." },
  { speaker: "priya", text: "The city and language on my profile actually match studies I see. Fewer dead ends." },
  { speaker: "noah", text: "I failed an attention check once. Fair. I slowed down and the next one approved." },
  { speaker: "lila", text: "This lounge is the bit I missed on other sites. People talking about the work, not shouting codes." },
  { speaker: "ken", text: "If you just got approved, take the Beginner ones while they are open. Read every question. That is the whole game." },
];

export function loungeDelayMs(rng = Math.random) {
  return Math.round(1800 + rng() * 3200);
}
