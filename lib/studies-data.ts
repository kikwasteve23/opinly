import type { Study } from "./types";
import { BEGINNER_STUDIES } from "./beginner-catalog";
import { TIER_NAMES } from "./referrals";

const FEATURED_STUDIES: Omit<Study, "published">[] = [
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
  {
    id: "checkout-friction",
    title: "Where checkout still fails",
    summary: "A Bronze usability pass on the last time you abandoned a cart.",
    kind: "usability",
    reward: 12,
    minutes: 16,
    format: "Usability",
    device: "Desktop preferred",
    tier: 2,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "The last time you left items in a cart, what stopped you?",
        options: ["Unexpected fees", "Account creation", "Payment failed", "I was just browsing", "The site was slow"],
        required: true,
      },
      {
        id: "q2",
        type: "multi",
        prompt: "Which checkout extras annoy you? Select all that apply.",
        options: ["Newsletter tick-boxes", "Forced accounts", "Address lookup that misses your street", "Captchas", "None of these"],
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Select “Checkout”.",
        options: ["Shipping", "Checkout", "Returns"],
        correct: "Checkout",
        required: true,
      },
      {
        id: "q3",
        type: "scale",
        prompt: "How confident are you that a new site will take your card on the first try?",
        options: ["1 — Not at all", "2", "3", "4", "5 — Completely"],
        required: true,
      },
      {
        id: "q4",
        type: "text",
        prompt: "Describe the last checkout you abandoned, step by step.",
        required: true,
      },
    ],
  },
  {
    id: "savings-buffers",
    title: "Emergency savings this year",
    summary: "A Gold study on buffers, debt, and the month money ran short.",
    kind: "survey",
    reward: 36,
    minutes: 18,
    format: "Survey",
    device: "Desktop preferred",
    tier: 3,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "How many months of essential bills could you cover from savings today?",
        options: ["None", "Under one month", "One to three months", "More than three months", "I do not know"],
        required: true,
      },
      {
        id: "q2",
        type: "multi",
        prompt: "If money ran short last year, what did you do? Select all that apply.",
        options: ["Used savings", "Borrowed from family", "Used a card", "Skipped a bill", "Worked extra hours", "It did not happen"],
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Type “savings” below.",
        required: true,
        correct: "savings",
      },
      {
        id: "q3",
        type: "text",
        prompt: "Walk through a month when you had to protect an emergency fund.",
        required: true,
      },
    ],
  },
  {
    id: "workplace-tools",
    title: "Tools you use to get work done",
    summary: "A Platinum study on software, workarounds, and what you would replace.",
    kind: "survey",
    reward: 68,
    minutes: 22,
    format: "Survey",
    device: "Desktop preferred",
    tier: 4,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "How many work apps do you open on a typical day?",
        options: ["1–3", "4–6", "7–10", "More than 10"],
        required: true,
      },
      {
        id: "q2",
        type: "multi",
        prompt: "Which problems waste the most time? Select all that apply.",
        options: ["Logins", "Slow tools", "Duplicate data entry", "Meetings about the tools", "None of these"],
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
      {
        id: "q3",
        type: "scale",
        prompt: "How likely are you to recommend your main work tool to a colleague?",
        options: ["1 — Not at all", "2", "3", "4", "5 — Very likely"],
        required: true,
      },
      {
        id: "q4",
        type: "text",
        prompt: "Describe a workaround you still use because the official tool falls short.",
        required: true,
      },
    ],
  },
  {
    id: "health-decisions",
    title: "Choosing a clinic or pharmacy",
    summary: "A Platinum study on trust, wait times, and paying for care.",
    kind: "survey",
    reward: 74,
    minutes: 24,
    format: "Survey",
    device: "Desktop preferred",
    tier: 4,
    questions: [
      {
        id: "q1",
        type: "single",
        prompt: "The last time you needed care, how did you choose where to go?",
        options: ["Closest place", "Someone recommended it", "Insurance list", "Online reviews", "I did not have a choice"],
        required: true,
      },
      {
        id: "q2",
        type: "text",
        prompt: "Describe a time cost, wait, or trust made you pick one clinic over another.",
        required: true,
      },
      {
        id: "attn1",
        type: "attention",
        prompt: "Type “clinic” below.",
        required: true,
        correct: "clinic",
      },
    ],
  },
];

export const DEFAULT_STUDIES: Study[] = [...FEATURED_STUDIES, ...BEGINNER_STUDIES]
  .filter((study, index, list) => list.findIndex((item) => item.id === study.id) === index)
  .map((study) => ({
    ...study,
    published: true,
    tier: study.tier ?? (study.reward >= 50 ? 4 : study.reward >= 20 ? 3 : study.reward >= 8 ? 2 : 1),
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
  return TIER_NAMES[tier] ?? TIER_NAMES[1];
}

export function questionCountLabel(count: number) {
  return count === 1 ? "1 question" : `${count} questions`;
}

export function isFinishedStudy(status: string | undefined) {
  return status === "approved" || status === "pending_review";
}

export function latestUserSubmission<T extends { studyId: string; updatedAt: string }>(
  submissions: T[],
  studyId: string,
): T | undefined {
  return submissions
    .filter((item) => item.studyId === studyId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}
