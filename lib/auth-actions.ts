"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { OPEN_COUNTRIES } from "@/lib/onboarding-data";
import { setSessionCookie, clearSessionCookie, getSessionUser } from "@/lib/session";
import { mutateStore, newId, readStoreSnapshot } from "@/lib/store";

export type AuthState = { error?: string } | null;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const data = await readStoreSnapshot();
  const user = data.users.find((u) => u.email === email) ?? null;
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Those details do not match an account." };
  }
  await setSessionCookie(user.id);
  redirect(user.onboardingStep === "complete" ? "/app" : "/onboarding");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const country = String(formData.get("country") ?? "");
  if (!email.includes("@") || password.length < 8) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }
  if (!OPEN_COUNTRIES.includes(country)) {
    return { error: "We are not recruiting in that country right now. Check back as new studies open." };
  }

  const created = await mutateStore(async (data) => {
    if (data.users.some((u) => u.email === email)) return null;
    const user = {
      id: newId("usr"),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
      profile: null,
      englishPassed: false,
      englishWriting: "",
      identityStatus: "not_started" as const,
      identityNote: "",
      onboardingStep: "profile" as const,
      available: 0,
      pending: 0,
      withdrawn: 0,
      payout: { network: "usdt_trc20" as const, address: "", addressChangedAt: null },
      lastWithdrawalAt: null,
    };
    data.users.push(user);
    return user;
  });
  if (!created) return { error: "An account with that email already exists. Log in instead." };
  await setSessionCookie(created.id);
  redirect("/onboarding");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function requireCompleteUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.onboardingStep !== "complete") redirect("/onboarding");
  return user;
}
