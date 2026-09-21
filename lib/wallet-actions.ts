"use server";

import { redirect } from "next/navigation";
import { ADDRESS_CHANGE_HOLD_MS, MIN_WITHDRAWAL, WITHDRAWAL_COOLDOWN_MS, quoteWithdrawal } from "@/lib/money";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore, newId } from "@/lib/store";
import type { PayoutNetwork } from "@/lib/money";
import { money } from "@/lib/utils";
import { getStudy } from "@/lib/studies-data";

export type WalletState = { error?: string; ok?: string } | null;

export async function withdrawAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await requireCompleteUser();
  if (user.identityStatus !== "approved") {
    return { error: "Withdrawals open after identity verification is approved." };
  }
  const amount = Number(formData.get("amount"));
  const network = String(formData.get("network") ?? "") as PayoutNetwork;
  const address = String(formData.get("address") ?? "").trim();
  if (!Number.isFinite(amount) || (network !== "usdt_trc20" && network !== "ltc") || address.length < 8) {
    return { error: "Enter an amount, a network, and a payout address." };
  }
  const quote = quoteWithdrawal(amount, network);
  if (!quote.valid) {
    return { error: `The minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(2)} after you cover fees.` };
  }

  const result = await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return { error: "Account missing." };
    if (quote.requested > current.available) return { error: "That is more than your available balance." };
    const now = Date.now();
    if (current.lastWithdrawalAt && now - new Date(current.lastWithdrawalAt).getTime() < WITHDRAWAL_COOLDOWN_MS) {
      return { error: "You can request one withdrawal every 72 hours." };
    }
    if (current.payout.address && current.payout.address !== address && current.payout.addressChangedAt) {
      if (now - new Date(current.payout.addressChangedAt).getTime() < ADDRESS_CHANGE_HOLD_MS) {
        return { error: "Withdrawals pause for 24 hours after you change a payout address." };
      }
    }
    if (current.payout.address && current.payout.address !== address) {
      current.payout.addressChangedAt = new Date().toISOString();
    }
    current.payout = {
      network,
      address,
      addressChangedAt: current.payout.addressChangedAt,
    };
    current.available = Math.round((current.available - quote.requested) * 100) / 100;
    current.withdrawn = Math.round((current.withdrawn + quote.requested) * 100) / 100;
    current.lastWithdrawalAt = new Date().toISOString();
    data.withdrawals.unshift({
      id: newId("wd"),
      userId: current.id,
      network,
      address,
      requested: quote.requested,
      platformFee: quote.platformFee,
      networkFee: quote.networkFee,
      arrives: quote.arrives,
      status: "processing",
      createdAt: new Date().toISOString(),
    });
    return { ok: `Withdrawal queued. ${money(quote.arrives)} will arrive at the address you entered.` };
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
  const study = getStudy(studyId);
  if (!study) return { error: "Study not found." };
  if (user.identityStatus !== "approved") {
    return { error: "Identity verification has to clear before you can submit." };
  }

  const result = await mutateStore((data) => {
    const currentUser = data.users.find((u) => u.id === user.id);
    const submission = data.submissions.find((s) => s.userId === user.id && s.studyId === studyId && s.status === "in_progress");
    if (!currentUser || !submission) return { error: "Start the study before submitting." };

    for (const question of study.questions) {
      const answer = submission.answers[question.id];
      const empty = answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0);
      if (question.required && empty) return { error: "Answer every required question before submitting." };
      if (question.type === "attention" && question.correct) {
        const value = Array.isArray(answer) ? answer.join(" ") : String(answer ?? "");
        if (value.trim().toLowerCase() !== question.correct.toLowerCase()) {
          submission.status = "rejected";
          submission.submittedAt = new Date().toISOString();
          submission.reviewedAt = new Date().toISOString();
          submission.rejectionReason = "An attention check was missed.";
          return { error: submission.rejectionReason };
        }
      }
    }

    const thin = study.questions
      .filter((q) => q.type === "text")
      .some((q) => String(submission.answers[q.id] ?? "").trim().length < 12);
    if (thin) {
      submission.status = "rejected";
      submission.submittedAt = new Date().toISOString();
      submission.reviewedAt = new Date().toISOString();
      submission.rejectionReason = "Written answers were too short to show genuine attention.";
      return { error: submission.rejectionReason };
    }

    submission.status = "approved";
    submission.submittedAt = new Date().toISOString();
    submission.reviewedAt = new Date().toISOString();
    submission.updatedAt = new Date().toISOString();
    currentUser.available = Math.round((currentUser.available + study.reward) * 100) / 100;
    return { ok: true as const };
  });

  if (result && "error" in result && result.error) return { error: result.error };
  redirect("/app");
}
