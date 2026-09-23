import bcrypt from "bcryptjs";
import { findStudy } from "./studies-data";
import { newId } from "./ids";
import { AUTO_APPROVE_MAX_MS, TEXT_MIN_CHARS, roundCents } from "./money";
import { findMarketer } from "./marketers";
import { normalizeUser } from "./normalize-user";
import type { StoreData, Study, Submission } from "./types";

export function textAnswersPass(study: Study, answers: Record<string, string | string[]>) {
  const texts = study.questions.filter((q) => q.type === "text");
  if (texts.length === 0) return true;
  return texts.every((q) => String(answers[q.id] ?? "").trim().length >= TEXT_MIN_CHARS);
}

export function processAutoApprovals(data: StoreData, now = Date.now()) {
  let changed = false;
  for (const submission of data.submissions) {
    if (submission.status !== "pending_review" || !submission.autoApproveAt) continue;
    if (new Date(submission.autoApproveAt).getTime() > now) continue;
    const user = data.users.find((u) => u.id === submission.userId);
    const study = findStudy(data.studies, submission.studyId);
    if (!user || !study) continue;
    user.pending = Math.max(0, roundCents(user.pending - study.reward));
    if (textAnswersPass(study, submission.answers)) {
      submission.status = "approved";
      user.available = roundCents(user.available + study.reward);
      data.ledger.unshift({
        id: newId("led"),
        userId: user.id,
        amount: study.reward,
        type: "study",
        note: `Auto-approved: ${study.title}`,
        createdAt: new Date(now).toISOString(),
        adminEmail: null,
      });
    } else {
      submission.status = "rejected";
      submission.rejectionReason = "Written answers were too short.";
    }
    submission.reviewedAt = new Date(now).toISOString();
    changed = true;
  }
  return changed;
}

function fillerAnswers(study: Study): Record<string, string | string[]> {
  const answers: Record<string, string | string[]> = {};
  for (const question of study.questions) {
    if (question.type === "multi") answers[question.id] = question.options?.slice(0, 1) ?? ["Yes"];
    else if (question.type === "text") answers[question.id] = "I joined from a marketer campaign and completed this sample survey carefully.";
    else if (question.type === "attention" && question.correct) answers[question.id] = question.correct;
    else answers[question.id] = question.options?.[0] ?? "Yes";
  }
  return answers;
}

export async function processMarketerJobs(data: StoreData, now = Date.now()) {
  const due = data.marketerJobs.filter(
    (job) => job.status === "processing" && new Date(job.completeAt).getTime() <= now,
  );
  if (due.length === 0) return false;

  let changed = false;
  const passwordHash = await bcrypt.hash(`hired-${now}`, 8);
  const sampleStudy = data.studies.find((s) => s.published) ?? data.studies[0];
  for (const job of due) {
    const buyer = data.users.find((u) => u.id === job.userId);
    const marketer = findMarketer(job.marketerId);
    if (!buyer || !marketer || !sampleStudy) {
      job.status = "failed";
      changed = true;
      continue;
    }
    for (let i = 0; i < job.quantity; i += 1) {
      const userId = newId("usr");
      const email = `hire.${job.id}.${i}@opinly.local`;
      if (data.users.some((u) => u.email === email)) continue;
      const recruit = normalizeUser({
        id: userId,
        email,
        passwordHash,
        referredBy: buyer.id,
        onboardingStep: "complete",
        englishPassed: true,
        identityStatus: "approved",
        identityNote: `Recruited by ${marketer.name}.`,
        englishWriting: "I heard about Opinly from a community campaign and wanted to take surveys.",
      });
      data.users.push(recruit);
      const submission: Submission = {
        id: newId("sub"),
        userId,
        studyId: sampleStudy.id,
        status: "approved",
        answers: fillerAnswers(sampleStudy),
        startedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now).toISOString(),
        submittedAt: new Date(now - 40 * 60 * 1000).toISOString(),
        reviewedAt: new Date(now).toISOString(),
        rejectionReason: null,
        autoApproveAt: null,
      };
      data.submissions.push(submission);
      job.addedUserIds.push(userId);
    }
    job.status = "complete";
    job.completedAt = new Date(now).toISOString();
    changed = true;
  }
  return changed;
}

export async function processDueWork(data: StoreData, now = Date.now()) {
  const a = processAutoApprovals(data, now);
  const b = await processMarketerJobs(data, now);
  return a || b;
}

export function stillWithinAutoWindow(submittedAt: string | null, now = Date.now()) {
  if (!submittedAt) return false;
  return now - new Date(submittedAt).getTime() <= AUTO_APPROVE_MAX_MS;
}
