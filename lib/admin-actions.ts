"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-actions";
import { mutateStore, newId } from "@/lib/store";
import { findStudy } from "@/lib/studies-data";
import type { IdentityStatus, Question, Study, StudyKind, WithdrawalStatus } from "@/lib/types";
import { generateSurveyDraft } from "@/lib/ai-survey";
import { startMarketerJob } from "@/lib/deposit-requests";
import { addQualifiedReferrals, attachExistingReferral, unlinkReferral } from "@/lib/admin-referrals";

export type AdminFormState = { error?: string; ok?: string } | null;

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
  revalidatePath("/admin/applicants");
  revalidatePath("/admin/people");
}

export async function recordDepositAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? formData.get("reason") ?? "").trim();
  if (!Number.isFinite(amount) || amount === 0) return { error: "Enter a USD amount. Use a negative number to debit." };
  if (!note) return { error: "Add a short reason for the ledger." };
  const result = await mutateStore((data) => {
    const user = data.users.find((u) => u.id === userId && u.role === "participant");
    if (!user) return { error: "Person not found." };
    const next = Math.round((user.available + amount) * 100) / 100;
    if (next < 0) return { error: "That would take the available balance below zero." };
    user.available = next;
    data.ledger.unshift({
      id: newId("led"),
      userId,
      amount,
      type: amount > 0 ? "deposit" : "adjustment",
      note,
      createdAt: new Date().toISOString(),
      adminEmail: admin.email,
    });
    return { ok: `Balance is now $${user.available.toFixed(2)}.` };
  });
  revalidatePath("/admin");
  revalidatePath("/admin/deposits");
  revalidatePath("/admin/people");
  return result;
}

export async function reviewDepositAction(formData: FormData) {
  const admin = await requireAdmin();
  const depositId = String(formData.get("depositId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  await mutateStore((data) => {
    const deposit = data.deposits.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== "pending") return;
    const user = data.users.find((u) => u.id === deposit.userId);
    if (!user) return;
    deposit.reviewedAt = new Date().toISOString();
    deposit.adminEmail = admin.email;
    deposit.adminNote = note || null;
    if (decision !== "approve") {
      deposit.status = "rejected";
      return;
    }
    deposit.status = "approved";
    if (deposit.purpose === "activation") {
      user.walletActivated = true;
      user.available = Math.round((user.available + deposit.amount) * 100) / 100;
      data.ledger.unshift({
        id: newId("led"),
        userId: user.id,
        amount: deposit.amount,
        type: "deposit",
        note: `Approved ${deposit.methodLabel} activation`,
        createdAt: new Date().toISOString(),
        adminEmail: admin.email,
      });
    } else if (deposit.marketerId && deposit.quantity) {
      startMarketerJob(data, user.id, deposit.marketerId, deposit.quantity);
      data.ledger.unshift({
        id: newId("led"),
        userId: user.id,
        amount: deposit.amount,
        type: "deposit",
        note: `Approved ${deposit.methodLabel} marketer hire × ${deposit.quantity}`,
        createdAt: new Date().toISOString(),
        adminEmail: admin.email,
      });
    }
  });
  revalidatePath("/admin");
  revalidatePath("/admin/deposits");
  revalidatePath("/app/deposit");
  revalidatePath("/app/wallet");
  revalidatePath("/app/marketers");
}

export async function adjustWalletAction(formData: FormData) {
  const wrapped = new FormData();
  formData.forEach((value, key) => wrapped.set(key, value));
  await recordDepositAction(null, wrapped);
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
    const study = findStudy(data.studies, submission.studyId);
    if (!user || !study) return;
    submission.reviewedAt = new Date().toISOString();
    submission.autoApproveAt = null;
    user.pending = Math.max(0, Math.round((user.pending - study.reward) * 100) / 100);
    if (decision === "approve") {
      submission.status = "approved";
      user.available = Math.round((user.available + study.reward) * 100) / 100;
      data.ledger.unshift({
        id: newId("led"),
        userId: user.id,
        amount: study.reward,
        type: "study",
        note: `Approved: ${study.title}`,
        createdAt: new Date().toISOString(),
        adminEmail: null,
      });
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
  revalidatePath("/admin/withdrawals");
}

function parseQuestions(raw: string): Question[] | null {
  try {
    const parsed = JSON.parse(raw) as Question[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSurveyAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const kind = String(formData.get("kind") ?? "survey") as StudyKind;
  const reward = Number(formData.get("reward"));
  const minutes = Number(formData.get("minutes"));
  const format = String(formData.get("format") ?? "Survey").trim() || "Survey";
  const device = String(formData.get("device") ?? "Desktop or phone").trim();
  const published = String(formData.get("published")) === "on" || String(formData.get("published")) === "true";
  const questions = parseQuestions(String(formData.get("questions") ?? "[]"));
  if (!title || !summary) return { error: "Title and summary are required." };
  if (!Number.isFinite(reward) || reward <= 0) return { error: "Set a positive reward." };
  if (!questions) return { error: "Questions must be a JSON array with at least one question." };

    const study: Study = {
    id: id || newId("std"),
    title,
    summary,
    kind: ["survey", "usability", "short_poll", "multi_day"].includes(kind) ? kind : "survey",
    reward,
    minutes: Number.isFinite(minutes) ? minutes : 10,
    format,
    device,
    published,
    tier: ([1, 2, 3, 4].includes(Number(formData.get("tier"))) ? Number(formData.get("tier")) : reward >= 50 ? 4 : reward >= 20 ? 3 : reward >= 8 ? 2 : 1) as Study["tier"],
    questions,
  };

  await mutateStore((data) => {
    const index = data.studies.findIndex((s) => s.id === study.id);
    if (index >= 0) data.studies[index] = study;
    else data.studies.unshift(study);
  });
  revalidatePath("/admin");
  revalidatePath("/app");
  return { ok: published ? "Survey is live." : "Draft saved." };
}

export type GenerateSurveyState = { error?: string; ok?: string; draft?: Study } | null;

export async function generateSurveyAction(_prev: GenerateSurveyState, formData: FormData): Promise<GenerateSurveyState> {
  await requireAdmin();
  const topic = String(formData.get("topic") ?? "").trim();
  if (topic.length < 4) return { error: "Describe the topic in a few words." };
  const generated = await generateSurveyDraft({
    topic,
    questionCount: Number(formData.get("questionCount") || 5),
    reward: Number(formData.get("reward") || 5),
    minutes: Number(formData.get("minutes") || 8),
    kind: (String(formData.get("kind") || "survey") as StudyKind) || "survey",
  });
  return {
    ok: generated.source === "openai" ? "Draft generated with AI. Review and save." : "Draft generated (no OPENAI_API_KEY, used the built-in writer). Review and save.",
    draft: generated.study,
  };
}

export async function toggleSurveyAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await mutateStore((data) => {
    const study = data.studies.find((s) => s.id === id);
    if (!study) return;
    study.published = !study.published;
  });
  revalidatePath("/admin");
  revalidatePath("/app");
}

export async function addReferralsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const count = Number(formData.get("count"));
  const result = await mutateStore((data) => addQualifiedReferrals(data, userId, count));
  revalidatePath("/admin");
  revalidatePath("/admin/people");
  revalidatePath(`/admin/people/${userId}`);
  revalidatePath("/app");
  if ("error" in result && result.error) return { error: result.error };
  return { ok: result.ok };
}

export async function attachReferralAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const email = String(formData.get("email") ?? "");
  const result = await mutateStore((data) => attachExistingReferral(data, userId, email));
  revalidatePath("/admin");
  revalidatePath("/admin/people");
  revalidatePath(`/admin/people/${userId}`);
  if ("error" in result && result.error) return { error: result.error };
  return { ok: result.ok };
}

export async function removeReferralAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const referralId = String(formData.get("referralId") ?? "");
  await mutateStore((data) => unlinkReferral(data, userId, referralId));
  revalidatePath("/admin");
  revalidatePath("/admin/people");
  revalidatePath(`/admin/people/${userId}`);
}

export async function deleteSurveyAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await mutateStore((data) => {
    data.studies = data.studies.filter((s) => s.id !== id);
  });
  revalidatePath("/admin");
  revalidatePath("/app");
}
