"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore, newId } from "@/lib/store";
import type { PayoutNetwork } from "@/lib/money";
import { ACTIVATION_DEPOSIT, MIN_WITHDRAWAL, randomDelay } from "@/lib/money";
import { applyWithdrawal } from "@/lib/withdraw";
import { submitStudyInStore } from "@/lib/submit-study";
import { findMarketer } from "@/lib/marketers";
import { NOWPAYMENTS } from "@/lib/geo";

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

export async function hireMarketerAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const marketerId = String(formData.get("marketerId") ?? "");
  const quantity = Number(formData.get("quantity"));
  const marketer = findMarketer(marketerId);
  if (!marketer) return { error: "That marketer is not available." };
  if (!Number.isInteger(quantity) || quantity < marketer.minOrder || quantity > marketer.maxOrder) {
    return { error: `Order between ${marketer.minOrder} and ${marketer.maxOrder} referrals.` };
  }
  const cost = Math.round(quantity * marketer.priceEach * 100) / 100;
  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    if (current.available < cost) return { error: `You need ${cost.toFixed(2)} USD available to hire ${marketer.name}.` };
    current.available = Math.round((current.available - cost) * 100) / 100;
    const hours = 1 + Math.random();
    data.marketerJobs.unshift({
      id: newId("job"),
      userId: current.id,
      marketerId: marketer.id,
      quantity,
      priceEach: marketer.priceEach,
      hiredAt: new Date().toISOString(),
      completeAt: new Date(Date.now() + randomDelay(60 * 60 * 1000, 2 * 60 * 60 * 1000)).toISOString(),
      completedAt: null,
      status: "processing",
      addedUserIds: [],
    });
    data.ledger.unshift({
      id: newId("led"),
      userId: current.id,
      amount: -cost,
      type: "marketer",
      note: `Hired ${marketer.name} for ${quantity} referrals`,
      createdAt: new Date().toISOString(),
      adminEmail: null,
    });
    return { ok: `${marketer.name} is filling ${quantity} referral slots. They usually land within ${hours.toFixed(1)} hours.` };
  });
  revalidatePath("/app/marketers");
  revalidatePath("/app/referrals");
  return result;
}

export async function confirmActivationDepositAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const method = String(formData.get("method") ?? "");
  if (!method) return { error: "Choose a payment method." };
  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    if (current.available < MIN_WITHDRAWAL) {
      return { error: `Activation opens once your available balance reaches $${MIN_WITHDRAWAL}.` };
    }
    if (current.walletActivated) return { error: "This wallet is already activated." };
    current.walletActivated = true;
    current.available = Math.round((current.available + ACTIVATION_DEPOSIT) * 100) / 100;
    const label = method === NOWPAYMENTS.id ? NOWPAYMENTS.name : method;
    data.ledger.unshift({
      id: newId("led"),
      userId: current.id,
      amount: ACTIVATION_DEPOSIT,
      type: "deposit",
      note: `Wallet activation via ${label}`,
      createdAt: new Date().toISOString(),
      adminEmail: null,
    });
    return {
      ok: `$${ACTIVATION_DEPOSIT.toFixed(0)} is now in your available balance. You can withdraw earnings plus this activation amount.`,
    };
  });
  revalidatePath("/app/deposit");
  revalidatePath("/app/wallet");
  return result;
}

export async function sendDepositChatAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) return { error: "Write a short message." };
  await mutateStore((data) => {
    data.chat.push({
      id: newId("msg"),
      userId: user.id,
      from: "user",
      body,
      createdAt: new Date().toISOString(),
    });
    const reply =
      body.toLowerCase().includes("now") || body.toLowerCase().includes("crypto")
        ? "NOWPayments is available in every country. Send the exact $50 USDT TRC20 to the invoice address on this page, then tap “I have sent the payment”. That $50 is credited to your balance."
        : "Use the local method for your country if you can; otherwise NOWPayments works everywhere. After you pay $50, confirm on this page. It is added to your available balance so you can withdraw it with your earnings.";
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
