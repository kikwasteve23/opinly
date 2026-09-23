import { autoApproveAt, TEXT_MIN_CHARS } from "./money";
import { canAccessStudyTier, countsFromStore, studyEarningsUsd, studyLockReason } from "./referrals";
import { textAnswersPass } from "./progression";
import { findStudy } from "./studies-data";
import type { StoreData } from "./types";

export function submitStudyInStore(data: StoreData, userId: string, studyId: string) {
  const study = findStudy(data.studies, studyId);
  if (!study) return { error: "Study not found." };
  const currentUser = data.users.find((u) => u.id === userId);
  const submission = data.submissions.find((s) => s.userId === userId && s.studyId === studyId && s.status === "in_progress");
  if (!currentUser || !submission) return { error: "Start the study before submitting." };
  if (currentUser.identityStatus !== "approved") {
    return { error: "Identity verification has to clear before you can submit." };
  }
  const { level } = countsFromStore(data, currentUser.id);
  const earnings = studyEarningsUsd(data.studies, data.submissions, currentUser.id);
  if (!canAccessStudyTier(currentUser, study.tier, level, earnings)) {
    return { error: studyLockReason(currentUser, study.tier, level, earnings) ?? "This study is locked." };
  }

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
        submission.autoApproveAt = null;
        return { error: submission.rejectionReason };
      }
    }
  }

  if (!textAnswersPass(study, submission.answers)) {
    submission.status = "rejected";
    submission.submittedAt = new Date().toISOString();
    submission.reviewedAt = new Date().toISOString();
    submission.rejectionReason = `Written answers need at least ${TEXT_MIN_CHARS} characters.`;
    submission.autoApproveAt = null;
    return { error: submission.rejectionReason };
  }

  submission.status = "pending_review";
  submission.submittedAt = new Date().toISOString();
  submission.updatedAt = new Date().toISOString();
  submission.autoApproveAt = autoApproveAt();
  currentUser.pending = Math.round((currentUser.pending + study.reward) * 100) / 100;
  return { ok: true as const, submission, user: currentUser };
}
