import { roundCents } from "./money";
import type { MarketerBilling } from "./types";

export const PAY_AFTER_SURCHARGE = 0.1;

export type Marketer = {
  id: string;
  slug: string;
  name: string;
  photo: string;
  headline: string;
  bio: string;
  region: string;
  languages: string[];
  specialties: string[];
  priceEach: number;
  hours: string;
  minOrder: number;
  maxOrder: number;
};

export const MARKETERS: Marketer[] = [
  {
    id: "mkt_amina",
    slug: "amina-okello",
    name: "Amina Okello",
    photo: "/marketers/amina.png",
    headline: "East Africa social campaigns. Steady, approved joiners.",
    bio: "Amina runs WhatsApp, Facebook, and community-group campaigns across Kenya, Uganda, and Tanzania. She only sends people who finish a first survey, so the accounts you get are already active — not empty sign-ups.",
    region: "East Africa",
    languages: ["English", "Swahili"],
    specialties: ["WhatsApp lists", "Facebook groups", "Community campaigns"],
    priceEach: 5,
    hours: "1–2 hours",
    minOrder: 5,
    maxOrder: 40,
  },
  {
    id: "mkt_jonas",
    slug: "jonas-meyer",
    name: "Jonas Meyer",
    photo: "/marketers/jonas.png",
    headline: "EU community groups. Higher intent, slightly slower fill.",
    bio: "Jonas works Discord, Telegram, and local Facebook groups in Germany, the Netherlands, and nearby markets. His joins tend to stay because he briefs people on what a study actually is before they sign up.",
    region: "European Union",
    languages: ["English", "German", "Dutch"],
    specialties: ["Discord", "Telegram", "EU community groups"],
    priceEach: 7,
    hours: "about 90 minutes",
    minOrder: 4,
    maxOrder: 30,
  },
  {
    id: "mkt_priya",
    slug: "priya-shah",
    name: "Priya Shah",
    photo: "/marketers/priya.png",
    headline: "WhatsApp and Telegram lists across South Asia.",
    bio: "Priya fills slots from India, Pakistan, and Bangladesh using closed WhatsApp and Telegram lists she has run for years. She screens for English and a completed first survey before she counts someone as delivered.",
    region: "South Asia",
    languages: ["English", "Hindi"],
    specialties: ["WhatsApp", "Telegram", "Survey-ready joiners"],
    priceEach: 6,
    hours: "1–2 hours",
    minOrder: 5,
    maxOrder: 50,
  },
  {
    id: "mkt_luis",
    slug: "luis-andrade",
    name: "Luis Andrade",
    photo: "/marketers/luis.png",
    headline: "LATAM short-form ads. Fast bursts of new accounts.",
    bio: "Luis buys short-form attention in Brazil, Mexico, and Colombia and funnels people into your invite. He is the person to hire when you want a burst of new accounts in about an hour.",
    region: "Latin America",
    languages: ["English", "Spanish", "Portuguese"],
    specialties: ["Short-form ads", "Invite bursts", "LATAM audiences"],
    priceEach: 8,
    hours: "about 1 hour",
    minOrder: 3,
    maxOrder: 25,
  },
  {
    id: "mkt_nora",
    slug: "nora-bennett",
    name: "Nora Bennett",
    photo: "/marketers/nora.png",
    headline: "US/UK quality panel. Priced at the top of the range.",
    bio: "Nora recruits from US and UK quality panels. She costs more because she filters for people who already take online studies seriously. Use her when you want fewer, higher-intent referrals.",
    region: "United States & United Kingdom",
    languages: ["English"],
    specialties: ["Quality panels", "US/UK research audiences"],
    priceEach: 10,
    hours: "1–2 hours",
    minOrder: 2,
    maxOrder: 20,
  },
];

export function findMarketer(id: string) {
  return MARKETERS.find((m) => m.id === id || m.slug === id) ?? null;
}

export function marketerQuote(priceEach: number, quantity: number, billing: MarketerBilling) {
  const base = roundCents(quantity * priceEach);
  const amount = billing === "postpaid" ? roundCents(base * (1 + PAY_AFTER_SURCHARGE)) : base;
  return { base, amount };
}

export function marketerDepositPath(marketerId: string, quantity: number, billing: MarketerBilling) {
  const params = new URLSearchParams({
    hire: marketerId,
    qty: String(quantity),
    billing,
  });
  return `/app/deposit?${params.toString()}`;
}

export function clampMarketerQty(marketer: Pick<Marketer, "minOrder" | "maxOrder">, raw: number) {
  if (!Number.isInteger(raw)) return null;
  if (raw < marketer.minOrder || raw > marketer.maxOrder) return null;
  return raw;
}
