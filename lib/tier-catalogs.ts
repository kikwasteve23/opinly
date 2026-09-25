import type { Study, StudyKind, StudyTier } from "./types";
import { questionsFor } from "./beginner-catalog";

type Spec = {
  id: string;
  title: string;
  summary: string;
  topic: string;
  reward: number;
  minutes: number;
  kind?: StudyKind;
};

function toStudies(specs: Spec[], tier: StudyTier): Omit<Study, "published">[] {
  return specs.map((spec) => ({
    id: spec.id,
    title: spec.title,
    summary: spec.summary,
    kind: spec.kind ?? "survey",
    reward: spec.reward,
    minutes: spec.minutes,
    format: spec.kind === "short_poll" ? "Short poll" : spec.kind === "usability" ? "Usability" : "Survey",
    device: "Desktop or phone",
    tier,
    questions: questionsFor(spec.topic),
  }));
}

const BRONZE_SPECS: Spec[] = [
  { id: "br-brand-switch", title: "Why you leave a brand", summary: "The last product you dropped and what would bring you back.", topic: "switching brands", reward: 11, minutes: 14 },
  { id: "br-checkout-drop", title: "Abandoning a checkout", summary: "Fees, accounts, and the last cart you walked away from.", topic: "online checkout", reward: 12, minutes: 16, kind: "usability" },
  { id: "br-bank-fees", title: "Bank fees you still pay", summary: "What you notice on a statement and what you never challenge.", topic: "bank fees", reward: 13, minutes: 15 },
  { id: "br-grocery-own", title: "Store brands versus big names", summary: "When a cheaper label is good enough, and when it is not.", topic: "store-brand groceries", reward: 10.5, minutes: 13 },
  { id: "br-app-onboard", title: "First ten minutes in a new app", summary: "Sign-in walls, tours, and what made you delete it.", topic: "app onboarding", reward: 12.5, minutes: 16, kind: "usability" },
  { id: "br-loyalty-cards", title: "Loyalty cards in your wallet", summary: "Points you chase and programmes you forgot existed.", topic: "loyalty programmes", reward: 10, minutes: 12 },
  { id: "br-insurance-claim", title: "Making an insurance claim", summary: "Paperwork, wait times, and whether you would use them again.", topic: "insurance claims", reward: 14, minutes: 16 },
  { id: "br-phone-plan", title: "Choosing a phone plan", summary: "Data, roaming, and the last time you compared carriers.", topic: "mobile phone plans", reward: 11.5, minutes: 14 },
  { id: "br-streaming-share", title: "Sharing streaming logins", summary: "Who is on the account, and what happens when the rules change.", topic: "shared streaming accounts", reward: 10.25, minutes: 12 },
  { id: "br-work-tools", title: "Software you need for work", summary: "What your job makes you use, and what you would replace.", topic: "workplace software", reward: 13.5, minutes: 16 },
  { id: "br-food-delivery-fee", title: "Delivery fees versus cooking", summary: "When the surcharge is worth it on a tired night.", topic: "food delivery fees", reward: 10.75, minutes: 13 },
  { id: "br-credit-score", title: "Checking a credit score", summary: "How often you look, and what you do when the number moves.", topic: "credit scores", reward: 14.5, minutes: 17 },
  { id: "br-used-cars", title: "Buying a used car", summary: "Dealers, listings, and the inspection you skipped or paid for.", topic: "used cars", reward: 15, minutes: 18 },
  { id: "br-clinic-wait", title: "Waiting at a clinic", summary: "Booking, walk-ins, and how long you will sit.", topic: "clinic wait times", reward: 12, minutes: 14 },
  { id: "br-home-internet", title: "Switching internet providers", summary: "Promos, contracts, and the last outage that pushed you.", topic: "switching internet providers", reward: 13, minutes: 15 },
  { id: "br-kids-school", title: "Paying for school extras", summary: "Uniforms, trips, and the costs that arrive mid-term.", topic: "school extra costs", reward: 12.75, minutes: 15 },
  { id: "br-job-interview", title: "Job interviews in 2026", summary: "Video calls, tests, and the last process that felt fair.", topic: "job interviews", reward: 14, minutes: 16 },
  { id: "br-online-safety", title: "Staying safe on shopping sites", summary: "What looks fake, and the last time you almost paid a scammer.", topic: "online shopping safety", reward: 13.25, minutes: 15 },
  { id: "br-public-transport", title: "Reliability of public transport", summary: "Delays, apps, and when you give up and take a car.", topic: "public transport reliability", reward: 11.25, minutes: 14 },
  { id: "br-energy-switch", title: "Switching electricity or gas", summary: "Comparison sites, lock-ins, and bills that still surprised you.", topic: "energy supplier switching", reward: 14.25, minutes: 16 },
  { id: "br-pharmacy-brand", title: "Generic medicine versus branded", summary: "What a pharmacist said, and what you actually bought.", topic: "generic medicines", reward: 11, minutes: 13 },
  { id: "br-customer-chat", title: "Chatbots versus a person", summary: "The last support chat that helped, and the one that looped.", topic: "customer support chatbots", reward: 12.25, minutes: 14, kind: "usability" },
  { id: "br-rent-deposit", title: "Rent deposits and holding fees", summary: "What you paid up front, and whether you got it back.", topic: "rental deposits", reward: 13.75, minutes: 16 },
  { id: "br-weekend-spend", title: "Where weekend money goes", summary: "Food, transport, and the spend you did not plan.", topic: "weekend spending", reward: 10.5, minutes: 12, kind: "short_poll" },
];

const GOLD_SPECS: Spec[] = [
  { id: "gd-household-budget", title: "How the household budget really works", summary: "Who decides, who pays, and what gets cut first.", topic: "household budgets", reward: 28, minutes: 20 },
  { id: "gd-savings-buffer", title: "Emergency savings this year", summary: "Buffers, debt, and the month money ran short.", topic: "emergency savings", reward: 32, minutes: 22 },
  { id: "gd-healthcare-pay", title: "Paying for care out of pocket", summary: "Clinics, pharmacies, and bills you delayed.", topic: "out-of-pocket healthcare", reward: 36, minutes: 22 },
  { id: "gd-home-loan", title: "Thinking about a home loan", summary: "Rates, deposits, and who you would ask first.", topic: "home loans", reward: 38, minutes: 24 },
  { id: "gd-small-business", title: "Running a small side business", summary: "Customers, payments, and the tools you actually use.", topic: "small businesses", reward: 34, minutes: 22 },
  { id: "gd-childcare-cost", title: "The real cost of childcare", summary: "Hours, trust, and what you would change tomorrow.", topic: "childcare costs", reward: 33, minutes: 21 },
  { id: "gd-pension-choice", title: "Retirement money decisions", summary: "What you contribute, skip, or do not understand yet.", topic: "retirement savings", reward: 40, minutes: 24 },
  { id: "gd-travel-insurance", title: "Buying travel insurance", summary: "When you tick the box, and when you skip it.", topic: "travel insurance", reward: 26, minutes: 18 },
  { id: "gd-car-finance", title: "Financing a car", summary: "Deals, interest, and walking away from the desk.", topic: "car finance", reward: 35, minutes: 22 },
  { id: "gd-university-fees", title: "Paying for college or training", summary: "Loans, family help, and whether it felt worth it.", topic: "education fees", reward: 37, minutes: 23 },
  { id: "gd-diet-health", title: "Eating for health on a budget", summary: "Advice you follow and food you still buy anyway.", topic: "healthy eating on a budget", reward: 27, minutes: 19 },
  { id: "gd-work-burnout", title: "Burnout at work", summary: "Hours, recovery, and what would make you stay.", topic: "workplace burnout", reward: 31, minutes: 20 },
  { id: "gd-local-government", title: "Dealing with local government", summary: "Permits, queues, and the last form that stalled.", topic: "local government services", reward: 29, minutes: 20 },
  { id: "gd-invest-apps", title: "Investing on a phone app", summary: "What you trust, and the last trade you second-guessed.", topic: "investment apps", reward: 39, minutes: 23 },
  { id: "gd-climate-home", title: "Making a home use less energy", summary: "What you installed, and what still feels too expensive.", topic: "home energy upgrades", reward: 30, minutes: 20 },
  { id: "gd-elder-care", title: "Helping an older relative", summary: "Money, time, and the decisions nobody wanted to own.", topic: "caring for older relatives", reward: 36.5, minutes: 23 },
];

const PLATINUM_SPECS: Spec[] = [
  { id: "pt-workplace-tools", title: "Tools you use to get work done", summary: "Software, workarounds, and what you would replace first.", topic: "professional work tools", reward: 58, minutes: 24 },
  { id: "pt-clinic-choice", title: "Choosing a clinic or pharmacy", summary: "Trust, wait times, and paying for care.", topic: "choosing clinics", reward: 62, minutes: 25 },
  { id: "pt-enterprise-buy", title: "Buying software for a team", summary: "Who signs off, who actually uses it, and what gets cancelled.", topic: "team software purchases", reward: 72, minutes: 28 },
  { id: "pt-hospital-bill", title: "A hospital or specialist bill", summary: "What you understood, what you disputed, and what you paid.", topic: "hospital billing", reward: 68, minutes: 26 },
  { id: "pt-wealth-advice", title: "Paying someone for money advice", summary: "Advisors, fees, and whether you would go back.", topic: "financial advice", reward: 74, minutes: 28 },
  { id: "pt-company-benefits", title: "Workplace benefits you actually use", summary: "Health, leave, and the perks that sit unused.", topic: "employee benefits", reward: 64, minutes: 25 },
  { id: "pt-supply-chain", title: "When a product is suddenly unavailable", summary: "Substitutes you accept and brands you wait for.", topic: "product shortages", reward: 56, minutes: 23 },
  { id: "pt-data-privacy", title: "Who you trust with personal data", summary: "Banks, apps, government, and the last leak that worried you.", topic: "personal data trust", reward: 70, minutes: 27 },
  { id: "pt-city-housing", title: "Finding housing in a tight market", summary: "Viewings, agents, and what you compromised on.", topic: "tight housing markets", reward: 66, minutes: 26 },
  { id: "pt-import-duties", title: "Paying duties on something you ordered", summary: "Surprise fees at the door and whether you ordered again.", topic: "import duties and fees", reward: 55, minutes: 22 },
  { id: "pt-board-decisions", title: "Decisions that affect a whole team", summary: "How your workplace actually chooses, not the org chart.", topic: "workplace decision making", reward: 76, minutes: 28 },
  { id: "pt-chronic-care", title: "Managing a long-term health condition", summary: "Appointments, meds, and costs that keep showing up.", topic: "long-term health care", reward: 71, minutes: 27 },
  { id: "pt-cross-border", title: "Sending money across borders", summary: "Fees, speed, and who you still trust with a transfer.", topic: "international money transfers", reward: 67, minutes: 25 },
  { id: "pt-public-tender", title: "Selling to a government or big firm", summary: "Paperwork, delays, and whether you would bid again.", topic: "selling to large organisations", reward: 78, minutes: 29 },
  { id: "pt-cyber-incident", title: "After a cyber incident at work", summary: "What froze, who was told, and what changed after.", topic: "workplace cyber incidents", reward: 73, minutes: 27 },
  { id: "pt-climate-risk", title: "Climate risk where you live or work", summary: "Flood, heat, insurance, and plans that are still on paper.", topic: "climate risk planning", reward: 69, minutes: 26 },
  { id: "pt-education-tech", title: "Technology in schools or training", summary: "What helped students, and what just added logins.", topic: "education technology", reward: 61, minutes: 24 },
  { id: "pt-logistics-last", title: "Last-mile delivery for a business", summary: "Couriers, failed drops, and the customer who waited.", topic: "last-mile delivery", reward: 63, minutes: 24 },
  { id: "pt-regulation", title: "A rule that changed how you work", summary: "Licences, compliance, and the cost of getting it wrong.", topic: "workplace regulation", reward: 75, minutes: 28 },
  { id: "pt-executive-travel", title: "Work travel that has to happen", summary: "Flights, policy, and the trip you would not repeat.", topic: "business travel", reward: 60, minutes: 23 },
];

export const BRONZE_STUDIES = toStudies(BRONZE_SPECS, 2);
export const GOLD_STUDIES = toStudies(GOLD_SPECS, 3);
export const PLATINUM_STUDIES = toStudies(PLATINUM_SPECS, 4);
