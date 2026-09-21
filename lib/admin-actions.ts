"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-actions";
import { mutateStore } from "@/lib/store";
import { getStudy } from "@/lib/studies-data";
import type { IdentityStatus, WithdrawalStatus } from "@/lib/types";

export async function setIdentityAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "") as IdentityStatus;
  const note = String(formData.get("note") ?? "").trim();
  if (!["approved", "rejected", "pending"].includes(status)) return;
  await mutateStore((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return;
    user.identityStatus = status;
    user.identityNote = note || `Identity ${status} by admin.`;
  });
  revalidatePath("/admin");
}

export async function adjustWalletAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!Number.isFinite(amount) || amount === 0) return;
  await mutateStore((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return;
    const next = Math.round((user.available + amount) * 100) / 100;
    if (next < 0) return;
    user.available = next;
    if (reason) user.identityNote = `${user.identityNote} Wallet ${amount > 0 ? "+" : ""}${amount}: ${reason}`;
  });
  revalidatePath("/admin");
}

export async function setAccountStatusAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "active" && status !== "suspended") return;
  await mutateStore((data) => {
    const user = data.users.find((u) => u.id === userId && u.role === "participant");
    if (!user) return;
    user.accountStatus = status;
  });
  revalidatePath("/admin");
}

export async function reviewSubmissionAction(formData: FormData) {
  await requireAdmin();
  const submissionId = String(formData.get("submissionId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  await mutateStore((data) => {
    const submission = data.submissions.find((s) => s.id === submissionId);
    if (!submission || submission.status !== "pending_review") return;
    const user = data.users.find((u) => u.id === submission.userId);
    const study = getStudy(submission.studyId);
    if (!user || !study) return;
    submission.reviewedAt = new Date().toISOString();
    user.pending = Math.max(0, Math.round((user.pending - study.reward) * 100) / 100);
    if (decision === "approve") {
      submission.status = "approved";
      user.available = Math.round((user.available + study.reward) * 100) / 100;
    } else {
      submission.status = "rejected";
      submission.rejectionReason = note || "Rejected by a reviewer.";
    }
  });
  revalidatePath("/admin");
}

export async function reviewWithdrawalAction(formData: FormData) {
  await requireAdmin();
  const withdrawalId = String(formData.get("withdrawalId") ?? "");
  const decision = String(formData.get("decision") ?? "") as WithdrawalStatus;
  const note = String(formData.get("note") ?? "").trim();
  await mutateStore((data) => {
    const withdrawal = data.withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal || withdrawal.status !== "processing") return;
    const user = data.users.find((u) => u.id === withdrawal.userId);
    withdrawal.reviewedAt = new Date().toISOString();
    withdrawal.adminNote = note || null;
    if (decision === "sent") {
      withdrawal.status = "sent";
    } else if (decision === "rejected" && user) {
      withdrawal.status = "rejected";
      user.available = Math.round((user.available + withdrawal.requested) * 100) / 100;
      user.withdrawn = Math.max(0, Math.round((user.withdrawn - withdrawal.requested) * 100) / 100);
    }
  });
  revalidatePath("/admin");
}
