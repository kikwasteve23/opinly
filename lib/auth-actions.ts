"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { OPEN_COUNTRIES } from "@/lib/onboarding-data";
import { setSessionCookie, clearSessionCookie, getSessionUser } from "@/lib/session";
import { makeReferralCode, mutateStore, newId, normalizeUser, readStoreSnapshot } from "@/lib/store";

export type AuthState = { error?: string } | null;

function afterLoginPath(user: { role: string; onboardingStep: string }) {
  if (user.role === "admin") return "/admin";
  if (user.onboardingStep !== "complete") return "/onboarding";
  return "/app";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const data = await readStoreSnapshot();
  const user = data.users.find((u) => u.email === email) ?? null;
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Those details do not match an account." };
  }
  if (user.accountStatus === "suspended") {
    return { error: "This account is suspended. Contact support if you think that is a mistake." };
  }
  await setSessionCookie(user.id);
  redirect(afterLoginPath(user));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const country = String(formData.get("country") ?? "");
  const referralCode = String(formData.get("referralCode") ?? "")
    .trim()
    .toUpperCase();
  if (!email.includes("@") || password.length < 8) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }
  if (!OPEN_COUNTRIES.includes(country)) {
    return { error: "We are not recruiting in that country right now. Check back as new studies open." };
  }

  const created = await mutateStore(async (data) => {
    if (data.users.some((u) => u.email === email)) return { error: "exists" as const };
    let referredBy: string | null = null;
    if (referralCode) {
      const sponsor = data.users.find((u) => u.referralCode === referralCode && u.role === "participant");
      if (!sponsor) return { error: "bad_code" as const };
      referredBy = sponsor.id;
    }
    const user = normalizeUser({
      id: newId("usr"),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      referralCode: makeReferralCode(),
      referredBy,
      onboardingStep: "profile",
    });
    data.users.push(user);
    return { user };
  });
  if ("error" in created) {
    if (created.error === "exists") return { error: "An account with that email already exists. Log in instead." };
    return { error: "That referral code is not recognised." };
  }
  await setSessionCookie(created.user.id);
  redirect("/onboarding");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function requireCompleteUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.accountStatus === "suspended") redirect("/login");
  if (user.onboardingStep !== "complete") redirect("/onboarding");
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login?staff=1");
  if (user.role !== "admin") redirect("/staff-access");
  return user;
}
