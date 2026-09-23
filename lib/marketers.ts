export type Marketer = {
  id: string;
  name: string;
  headline: string;
  priceEach: number;
  hours: string;
  minOrder: number;
  maxOrder: number;
};

export const MARKETERS: Marketer[] = [
  {
    id: "mkt_amina",
    name: "Amina Okello",
    headline: "East Africa social campaigns. Steady, approved joiners.",
    priceEach: 5,
    hours: "1–2 hours",
    minOrder: 5,
    maxOrder: 40,
  },
  {
    id: "mkt_jonas",
    name: "Jonas Meyer",
    headline: "EU community groups. Higher intent, slightly slower fill.",
    priceEach: 7,
    hours: "about 90 minutes",
    minOrder: 4,
    maxOrder: 30,
  },
  {
    id: "mkt_priya",
    name: "Priya Shah",
    headline: "WhatsApp and Telegram lists across South Asia.",
    priceEach: 6,
    hours: "1–2 hours",
    minOrder: 5,
    maxOrder: 50,
  },
  {
    id: "mkt_luis",
    name: "Luis Andrade",
    headline: "LATAM short-form ads. Fast bursts of new accounts.",
    priceEach: 8,
    hours: "about 1 hour",
    minOrder: 3,
    maxOrder: 25,
  },
  {
    id: "mkt_nora",
    name: "Nora Bennett",
    headline: "US/UK quality panel. Priced at the top of the range.",
    priceEach: 10,
    hours: "1–2 hours",
    minOrder: 2,
    maxOrder: 20,
  },
];

export function findMarketer(id: string) {
  return MARKETERS.find((m) => m.id === id) ?? null;
}
