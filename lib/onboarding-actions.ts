"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session";
import { mutateStore } from "@/lib/store";
import { ENGLISH_QUESTIONS } from "@/lib/onboarding-data";
import { saveEnglishInStore, saveProfileInStore } from "@/lib/onboarding";

export type OnboardingState = { error?: string } | null;

export async function saveProfileAction(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session expired. Log in again, then continue About you." };
  const languages = String(formData.get("languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const result = await mutateStore((data) =>
    saveProfileInStore(data, user.id, {
      legalName: String(formData.get("legalName") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      gender: String(formData.get("gender") ?? ""),
      country: String(formData.get("country") ?? ""),
      city: String(formData.get("city") ?? ""),
      region: String(formData.get("region") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      languages,
      occupation: String(formData.get("occupation") ?? ""),
    }),
  );
  if ("error" in result) return { error: result.error };
  revalidatePath("/onboarding");
  redirect("/onboarding");
}

export async function saveEnglishAction(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session expired. Log in again, then finish the English step." };
  const answers: Record<string, string> = {};
  for (const question of ENGLISH_QUESTIONS) {
    answers[question.id] = String(formData.get(question.id) ?? "");
  }
  const result = await mutateStore((data) =>
    saveEnglishInStore(data, user.id, {
      answers,
      writing: String(formData.get("writing") ?? ""),
    }),
  );
  if ("error" in result) return { error: result.error };
  revalidatePath("/app");
  revalidatePath("/onboarding");
  redirect("/app");
}
