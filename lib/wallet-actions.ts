"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore, newId } from "@/lib/store";
import type { PayoutNetwork } from "@/lib/money";
import { ACTIVATION_DEPOSIT, MIN_WITHDRAWAL } from "@/lib/money";
import { applyWithdrawal } from "@/lib/withdraw";
import { submitStudyInStore } from "@/lib/submit-study";
import { findMarketer } from "@/lib/marketers";
import { paymentMethodLabel } from "@/lib/deposit-requests";

export type WalletState = { error?: string; ok?: string } | null;

export async function withdrawAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const amount = Number(formData.get("amount"));
  const network = String(formData.get("network") ?? "") as PayoutNetwork;
  const address = String(formData.get("address") ?? "").trim();
  if (!Number.isFinite(amount) || (network !== "usdt_trc20" && network !== "ltc") || address.length < 8) {
    return { error: "Enter an amount, a network, and a payout address." };
  }

  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    const applied = applyWithdrawal(data, current, { amount, network, address });
    if ("error" in applied) return { error: applied.error };
    return { ok: applied.ok };
  });

  return result;
}

export type StudySubmitState = { error?: string } | null;

export async function saveStudyAction(studyId: string, answers: Record<string, string | string[]>) {
  const user = await requireCompleteUser();
  await mutateStore((data) => {
    const current = data.submissions.find((s) => s.userId === user.id && s.studyId === studyId && s.status === "in_progress");
    if (!current) return;
    current.answers = { ...current.answers, ...answers };
    current.updatedAt = new Date().toISOString();
  });
}

export async function submitStudyAction(studyId: string, answers: Record<string, string | string[]>): Promise<StudySubmitState> {
  const user = await requireCompleteUser();
  await saveStudyAction(studyId, answers);
  const result = await mutateStore((data) => submitStudyInStore(data, user.id, studyId));
  if (result && "error" in result && result.error) return { error: result.error };
  redirect("/app");
}

export async function submitDepositRequestAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const method = String(formData.get("method") ?? "").trim();
  if (!method) return { error: "Choose a payment method." };
  const marketerId = String(formData.get("marketerId") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const hire = marketerId ? findMarketer(marketerId) : null;
  if (marketerId && !hire) return { error: "That marketer is not available." };
  if (hire && (!Number.isInteger(quantity) || quantity < hire.minOrder || quantity > hire.maxOrder)) {
    return { error: `Order between ${hire.minOrder} and ${hire.maxOrder} referrals.` };
  }
  const amount = hire ? Math.round(quantity * hire.priceEach * 100) / 100 : ACTIVATION_DEPOSIT;
  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    if (!hire) {
      if (current.available < MIN_WITHDRAWAL) {
        return { error: `Activation opens once your available balance reaches $${MIN_WITHDRAWAL}.` };
      }
      if (current.walletActivated) return { error: "This wallet is already activated." };
    }
    const pendingSame = data.deposits.some(
      (d) => d.userId === current.id && d.status === "pending" && d.purpose === (hire ? "marketer" : "activation"),
    );
    if (pendingSame) return { error: "You already have a payment waiting for admin approval." };
    data.deposits.unshift({
      id: newId("dep"),
      userId: current.id,
      amount,
      method,
      methodLabel: paymentMethodLabel(method),
      purpose: hire ? "marketer" : "activation",
      marketerId: hire?.id ?? null,
      quantity: hire ? quantity : null,
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      adminNote: null,
      adminEmail: null,
    });
    return {
      ok: `Payment submitted. An admin will match ${hire ? paymentMethodLabel(method) : "your transfer"} and approve it before funds or referrals are released.`,
    };
  });
  revalidatePath("/app/deposit");
  revalidatePath("/admin/deposits");
  return result;
}

export async function sendDepositChatAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) return { error: "Write a short message." };
  await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    const za = current?.detectedCountry === "ZA" || current?.profile?.country === "South Africa";
    data.chat.push({
      id: newId("msg"),
      userId: user.id,
      from: "user",
      body,
      createdAt: new Date().toISOString(),
    });
    let reply =
      "Use the local method for your country if you can; otherwise NOWPayments works everywhere. After you pay, tap “I have sent the payment”. An admin has to approve it before anything is credited.";
    if (za) {
      reply =
        "For South Africa, use Capitec. Capitec app → Pay → Capitec account 1480054321, branch 470010, reference = your Opinly email, exact ZAR amount. Then tap “I have sent the payment”. An admin will match it before funds or referrals are released.";
    } else if (body.toLowerCase().includes("now") || body.toLowerCase().includes("crypto")) {
      reply =
        "NOWPayments is available in every country. Send the exact USD amount as USDT TRC20 to the invoice address, then tap “I have sent the payment”. An admin approves the match.";
    }
    data.chat.push({
      id: newId("msg"),
      userId: user.id,
      from: "support",
      body: reply,
      createdAt: new Date().toISOString(),
    });
  });
  revalidatePath("/app/deposit");
  return { ok: "Sent." };
}
