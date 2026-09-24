"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore, newId } from "@/lib/store";
import type { PayoutNetwork } from "@/lib/money";
import { ACTIVATION_DEPOSIT, MIN_WITHDRAWAL } from "@/lib/money";
import { applyWithdrawal } from "@/lib/withdraw";
import { submitStudyInStore } from "@/lib/submit-study";
import { findMarketer, marketerQuote } from "@/lib/marketers";
import { paymentMethodLabel, startMarketerJob } from "@/lib/deposit-requests";
import { canAccessStudyTier, countsFromStore, hitWalletCap } from "@/lib/referrals";
import type { MarketerBilling } from "@/lib/types";

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
    const currentUser = data.users.find((u) => u.id === user.id);
    const study = data.studies.find((s) => s.id === studyId);
    if (currentUser && study) {
      const { level } = countsFromStore(data, currentUser.id);
      if (!canAccessStudyTier(currentUser, study.tier, level)) return;
    }
    const current = data.submissions.find((s) => s.userId === user.id && s.studyId === studyId && s.status === "in_progress");
    if (!current) return;
    current.answers = { ...current.answers, ...answers };
    current.updatedAt = new Date().toISOString();
  });
}

export async function submitStudyAction(studyId: string, answers: Record<string, string | string[]>): Promise<StudySubmitState> {
  const user = await requireCompleteUser();
  const result = await mutateStore((data) => {
    const current = data.submissions.find((s) => s.userId === user.id && s.studyId === studyId && s.status === "in_progress");
    if (current) {
      current.answers = { ...current.answers, ...answers };
      current.updatedAt = new Date().toISOString();
    }
    return submitStudyInStore(data, user.id, studyId);
  });
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
  const billing = (String(formData.get("billing") ?? "prepaid") === "postpaid" ? "postpaid" : "prepaid") as MarketerBilling;
  const amount = hire
    ? marketerQuote(hire.priceEach, quantity, billing).amount
    : ACTIVATION_DEPOSIT;
  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    if (hire && !hitWalletCap(current)) {
      return { error: "Marketer hires open after you finish Beginner surveys and are ready to upgrade." };
    }
    if (!hire) {
      if (current.available < MIN_WITHDRAWAL) {
        return { error: "Wallet activation opens when your available balance reaches $500." };
      }
      if (current.walletActivated) return { error: "This wallet is already activated." };
    }
    if (hire && billing === "postpaid") {
      const invoice = data.marketerJobs.find(
        (j) =>
          j.userId === current.id &&
          j.marketerId === hire.id &&
          j.billing === "postpaid" &&
          !j.paidAt &&
          j.status === "complete",
      );
      if (!invoice) {
        return { error: "Pay-after invoices open once the referrals have landed. Hire with Pay after first, then come back to pay." };
      }
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
      billing: hire ? billing : null,
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
    data.chat.push({
      id: newId("msg"),
      userId: user.id,
      from: "user",
      body,
      createdAt: new Date().toISOString(),
      adminName: null,
    });
  });
  revalidatePath("/app/deposit");
  revalidatePath("/admin/support");
  revalidatePath("/admin");
  return { ok: "Sent. An admin will reply in this thread." };
}

export async function hireMarketerPayAfterAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  const marketerId = String(formData.get("marketerId") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const hire = findMarketer(marketerId);
  if (!hire) return { error: "That marketer is not available." };
  if (!Number.isInteger(quantity) || quantity < hire.minOrder || quantity > hire.maxOrder) {
    return { error: `Order between ${hire.minOrder} and ${hire.maxOrder} referrals.` };
  }
  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    if (!hitWalletCap(current)) {
      return { error: "Marketer hires open after you finish Beginner surveys and are ready to upgrade." };
    }
    const busy = data.marketerJobs.some(
      (j) => j.userId === current.id && (j.status === "processing" || (j.billing === "postpaid" && !j.paidAt)),
    );
    if (busy) return { error: "Finish or pay your current hire before starting another pay-after order." };
    startMarketerJob(data, current.id, hire.id, quantity, "postpaid");
    const due = marketerQuote(hire.priceEach, quantity, "postpaid").amount;
    return {
      ok: `${hire.name} is filling ${quantity} referrals. Pay $${due.toFixed(2)} (10% extra) after they land.`,
    };
  });
  revalidatePath("/app/marketers");
  revalidatePath("/app");
  return result;
}
