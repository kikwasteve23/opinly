import { ENGLISH_QUESTIONS } from "./onboarding-data";
import { countryFromName } from "./geo";
import type { StoreData, User } from "./types";

export type OnboardingResult = { error: string } | { user: User };

export function parseDateOfBirth(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const slash = value.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const year = Number(slash[3]);
    const monthFirst = a <= 12;
    const date = monthFirst
      ? new Date(Date.UTC(year, a - 1, b))
      : new Date(Date.UTC(year, b - 1, a));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function yearsOld(born: Date, now = Date.now()) {
  return (now - born.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

export function saveProfileInStore(
  data: StoreData,
  userId: string,
  input: {
    legalName: string;
    dateOfBirth: string;
    gender: string;
    country: string;
    city: string;
    region: string;
    postalCode: string;
    languages: string[];
    occupation: string;
  },
): OnboardingResult {
  const current = data.users.find((u) => u.id === userId);
  if (!current) return { error: "Sign in required." };
  const born = parseDateOfBirth(input.dateOfBirth);
  if (!born || yearsOld(born) < 18) return { error: "You must be 18 or over to join Opinly." };
  if (!input.legalName.trim() || !input.gender || !input.city.trim() || !input.region.trim() || !input.occupation.trim()) {
    return { error: "Fill in every profile field so we can match you to studies." };
  }
  if (input.postalCode.trim().length < 2 || input.languages.length === 0) {
    return { error: "Fill in every profile field so we can match you to studies." };
  }
  current.profile = {
    legalName: input.legalName.trim(),
    dateOfBirth: input.dateOfBirth.trim(),
    gender: input.gender,
    country: input.country,
    city: input.city.trim(),
    region: input.region.trim(),
    postalCode: input.postalCode.trim(),
    languages: input.languages,
    occupation: input.occupation.trim(),
  };
  current.detectedCountry = countryFromName(input.country).code;
  if (!current.englishPassed) current.onboardingStep = "english";
  return { user: current };
}

export function saveEnglishInStore(
  data: StoreData,
  userId: string,
  input: { answers: Record<string, string>; writing: string },
): OnboardingResult {
  const current = data.users.find((u) => u.id === userId);
  if (!current) return { error: "Sign in required." };
  if (input.writing.trim().length < 40) {
    return { error: "Answer the grammar questions and write at least a few sentences." };
  }
  const correct = ENGLISH_QUESTIONS.filter((q) => input.answers[q.id] === q.correct).length;
  if (correct < 2) {
    return { error: "That score is below the bar. Read each question once more and try again." };
  }
  current.englishPassed = true;
  current.englishWriting = input.writing.trim();
  current.onboardingStep = "complete";
  return { user: current };
}
