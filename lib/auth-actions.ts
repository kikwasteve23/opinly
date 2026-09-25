"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { OPEN_COUNTRIES } from "@/lib/onboarding-data";
import { countryFromName } from "@/lib/geo";
import { setSessionCookie, clearSessionCookie, getSessionUser } from "@/lib/session";
import { makeReferralCode, mutateStore, newId, normalizeUser, readStoreSnapshot } from "@/lib/store";
import { accountsOnDevice, DEVICE_LIMIT_MESSAGE, ensureDeviceCookie, MAX_ACCOUNTS_PER_DEVICE, readDeviceIds } from "@/lib/device";
import { generateRecoveryCodes, matchRecoveryCode } from "@/lib/recovery";

export type AuthState = { error?: string; codes?: string[]; ok?: string } | null;

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
  await ensureDeviceCookie();
  const deviceIds = await readDeviceIds(String(formData.get("deviceToken") ?? ""));
  if (deviceIds.length && user.role === "participant") {
    await mutateStore((data) => {
      const current = data.users.find((u) => u.id === user.id);
      if (!current) return;
      const next = new Set(current.deviceIds);
      for (const id of deviceIds) next.add(id);
      current.deviceIds = [...next];
    });
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

  await ensureDeviceCookie();
  const deviceIds = await readDeviceIds(String(formData.get("deviceToken") ?? ""));
  const recovery = generateRecoveryCodes();

  const created = await mutateStore(async (data) => {
    if (data.users.some((u) => u.email === email)) return { error: "exists" as const };
    if (accountsOnDevice(data.users, deviceIds) >= MAX_ACCOUNTS_PER_DEVICE) {
      return { error: "device_limit" as const };
    }
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
      detectedCountry: countryFromName(country).code,
      recoveryCodeHashes: recovery.hashes,
      deviceIds,
    });
    data.users.push(user);
    return { user };
  });
  if ("error" in created) {
    if (created.error === "exists") return { error: "An account with that email already exists. Log in instead." };
    if (created.error === "device_limit") return { error: DEVICE_LIMIT_MESSAGE };
    return { error: "That referral code is not recognised." };
  }
  await setSessionCookie(created.user.id);
  return { codes: recovery.codes };
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("recoveryCode") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!email.includes("@") || password.length < 8) {
    return { error: "Enter your email and a new password of at least 8 characters." };
  }
  if (password !== confirm) return { error: "The two passwords do not match." };

  const result = await mutateStore(async (data) => {
    const user = data.users.find((u) => u.email === email && u.role === "participant");
    if (!user) return { error: "Those details do not match an account." };
    if (user.accountStatus === "suspended") return { error: "This account is suspended." };
    const index = matchRecoveryCode(user.recoveryCodeHashes, code);
    if (index < 0) return { error: "That recovery code is not valid, or it has already been used." };
    user.recoveryCodeHashes.splice(index, 1);
    user.passwordHash = await bcrypt.hash(password, 10);
    return { ok: true as const };
  });
  if ("error" in result) return { error: result.error };
  return { ok: "Password updated. Log in with your new password." };
}

export async function issueRecoveryCodesAction(): Promise<AuthState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sign in to issue new recovery codes." };
  const recovery = generateRecoveryCodes();
  await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return;
    current.recoveryCodeHashes = recovery.hashes;
  });
  return { codes: recovery.codes };
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
