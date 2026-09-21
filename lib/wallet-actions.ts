"use server";

import { redirect } from "next/navigation";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore } from "@/lib/store";
import type { PayoutNetwork } from "@/lib/money";
import { findStudy } from "@/lib/studies-data";
import { applyWithdrawal } from "@/lib/withdraw";

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
  if (user.identityStatus !== "approved") {
    return { error: "Identity verification has to clear before you can submit." };
  }

  const result = await mutateStore((data) => {
    const study = findStudy(data.studies, studyId);
    if (!study) return { error: "Study not found." };
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

    submission.status = "pending_review";
    submission.submittedAt = new Date().toISOString();
    submission.updatedAt = new Date().toISOString();
    currentUser.pending = Math.round((currentUser.pending + study.reward) * 100) / 100;
    return { ok: true as const };
  });

  if (result && "error" in result && result.error) return { error: result.error };
  redirect("/app");
}
