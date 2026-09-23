import type { Study } from "./types";

const SEED_STUDIES: Omit<Study, "published">[] = [
  {
    id: "streaming-choice",
    title: "How do you choose a streaming service?",
    summary: "A short survey about how you pick what to watch, and what would make you switch.",
    kind: "survey",
    reward: 4.5,
    minutes: 9,
    format: "Multiple choice",
    device: "Desktop or phone",
    tier: 1,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "Which streaming service do you use most often?",
        options: ["Netflix", "YouTube", "Disney+", "Amazon Prime Video", "I mostly use free or ad-supported options", "I do not stream video"],
        required: true,
      },
      {
        id: "q2",
        type: "multi",
        prompt: "What matters most when you decide to keep or cancel a subscription? Select all that apply.",
        options: ["Price", "Original shows", "Sports", "Kids content", "How easy it is to find something", "Whether friends talk about it"],
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "To confirm you are reading the questions, select “I am paying attention”.",
        options: ["Skip this question", "I am paying attention", "I never watch video"],
        correct: "I am paying attention",
        required: true,
      },
      {
        id: "q3",
        type: "scale",
        prompt: "How likely are you to pay more for fewer ads?",
        options: ["1 — Not at all", "2", "3", "4", "5 — Very likely"],
        required: true,
      },
      {
        id: "q4",
        type: "text",
        prompt: "In a sentence or two, describe the last time you cancelled or considered cancelling a streaming service.",
        required: true,
      },
    ],
  },
  {
    id: "price-rise-shopping",
    title: "Shopping habits after a price rise",
    summary: "How you react when everyday items cost more than they did last year.",
    kind: "survey",
    reward: 6,
    minutes: 12,
    format: "Survey",
    device: "Desktop or phone",
    tier: 1,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "When a grocery staple goes up in price, what do you usually do first?",
        options: ["Buy less of it", "Switch to a store brand", "Shop at a cheaper store", "Keep buying the same thing", "Stock up if it is on sale"],
        required: true,
      },
      {
        id: "q2",
        type: "multi",
        prompt: "Which categories have you cut back on in the last six months?",
        options: ["Eating out", "Clothes", "Takeaway coffee", "Streaming or apps", "Travel", "None of these"],
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Please select “Groceries” so we know this form is being read.",
        options: ["Electronics", "Groceries", "Airline tickets"],
        correct: "Groceries",
        required: true,
      },
      {
        id: "q3",
        type: "text",
        prompt: "Tell us about one purchase you delayed or skipped because of price.",
        required: true,
      },
    ],
  },
  {
    id: "onboarding-flows",
    title: "Rate three app onboarding flows",
    summary: "Look at three short descriptions of first-run app experiences and say which feels clearer.",
    kind: "usability",
    reward: 9.25,
    minutes: 18,
    format: "Usability",
    device: "Desktop preferred",
    tier: 2,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "Flow A asks for an email, then a 6-digit code, then a username. How clear is that?",
        options: ["Very clear", "Mostly clear", "A bit confusing", "I would quit"],
        required: true,
      },
      {
        id: "q2",
        type: "single",
        prompt: "Flow B lets you browse first and only asks you to sign in when you save something. How do you feel about that?",
        options: ["I prefer this", "Fine either way", "I would rather sign in immediately", "I do not trust apps that delay sign-in"],
        required: true,
      },
      {
        id: "q3",
        type: "single",
        prompt: "Flow C uses “Continue with Google” as the only option on the first screen. Your reaction?",
        options: ["Convenient", "I want an email option too", "I would leave", "I do not use Google"],
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "This is an attention check. Choose “Flow B”.",
        options: ["Flow A", "Flow B", "Flow C"],
        correct: "Flow B",
        required: true,
      },
      {
        id: "q4",
        type: "text",
        prompt: "Which of the three would you keep using, and why?",
        required: true,
      },
    ],
  },
  {
    id: "news-trust",
    title: "Quick poll: news and trust",
    summary: "A four-minute poll about where you get news and how much you trust it.",
    kind: "short_poll",
    reward: 1.75,
    minutes: 4,
    format: "Short poll",
    device: "Desktop or phone",
    tier: 1,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "Where did you last see a news story?",
        options: ["A website or app of a news organisation", "Social media", "A messaging group", "Television or radio", "Someone told me"],
        required: true,
      },
      {
        id: "q2",
        type: "scale",
        prompt: "How much do you trust the news you see most often?",
        options: ["1 — Not at all", "2", "3", "4", "5 — Completely"],
        required: true,
      },
      {
        id: "q3",
        type: "text",
        prompt: "Name one source you still trust, and one you no longer do.",
        required: true,
      },
    ],
  },
  {
    id: "diary-week",
    title: "Diary study: one entry a day, 5 days",
    summary: "A sample first-day diary entry about how you used your phone this morning. Later days would unlock in a live study.",
    kind: "multi_day",
    reward: 22,
    minutes: 5,
    format: "Multi-day · 5 × 5 min",
    device: "Phone preferred",
    tier: 3,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "What was the first app you opened today?",
        options: ["Messages", "Email", "Social media", "News", "Maps or transit", "Something else"],
        required: true,
      },
      {
        id: "q2",
        type: "text",
        prompt: "Describe, in your own words, the first ten minutes you spent on your phone this morning.",
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Please type the word “diary” in the box below.",
        required: true,
        correct: "diary",
      },
    ],
  },
  {
    id: "brand-loyalty",
    title: "What keeps you loyal to a brand?",
    summary: "A higher-paying survey about switching costs, trust, and why you stay with a product.",
    kind: "survey",
    reward: 18,
    minutes: 14,
    format: "Survey",
    device: "Desktop or phone",
    tier: 2,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "When did you last switch away from a brand you used every week?",
        options: ["This month", "This year", "More than a year ago", "I rarely switch"],
        required: true,
      },
      {
        id: "q2",
        type: "text",
        prompt: "Describe a brand you stuck with even after a price rise, and why.",
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Select “I am paying attention”.",
        options: ["Skip", "I am paying attention"],
        correct: "I am paying attention",
        required: true,
      },
    ],
  },
  {
    id: "household-finance",
    title: "Household money decisions this quarter",
    summary: "A premium study on how you plan spending, debt, and savings when prices move.",
    kind: "survey",
    reward: 42,
    minutes: 20,
    format: "Survey",
    device: "Desktop preferred",
    tier: 3,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "Who has the final say on a large household purchase?",
        options: ["Me", "A partner", "We decide together", "Someone else"],
        required: true,
      },
      {
        id: "q2",
        type: "text",
        prompt: "Walk us through the last time you delayed a purchase to protect savings.",
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Type “budget” below.",
        required: true,
        correct: "budget",
      },
    ],
  },
];

export const DEFAULT_STUDIES: Study[] = SEED_STUDIES.map((study) => ({
  ...study,
  published: true,
  tier: study.tier ?? (study.reward >= 20 ? 3 : study.reward >= 8 ? 2 : 1),
}));

export function findStudy(studies: Study[], id: string) {
  return studies.find((study) => study.id === id) ?? null;
}

export function getStudy(id: string) {
  return findStudy(DEFAULT_STUDIES, id);
}

export function kindLabel(kind: Study["kind"]) {
  switch (kind) {
    case "survey":
      return "Survey";
    case "usability":
      return "Usability";
    case "short_poll":
      return "Short poll";
    case "multi_day":
      return "Multi-day";
  }
}

export function tierLabel(tier: Study["tier"]) {
  if (tier === 3) return "Level 3";
  if (tier === 2) return "Level 2";
  return "Level 1";
}
