import { findStudy, kindLabel } from "./studies-data";
import { mutateStore, newId } from "./store";
import { canAccessStudyTier, countsFromStore, studyEarningsUsd, studyLockReason } from "./referrals";
import type { User } from "./types";

export async function loadStudyForUser(user: User, id: string) {
  return mutateStore((data, markDirty) => {
    const study = findStudy(data.studies, id);
    if (!study || !study.published) return null;
    const { level } = countsFromStore(data, user.id);
    const earnings = studyEarningsUsd(data.studies, data.submissions, user.id);
    const allowed = canAccessStudyTier(user, study.tier, level, earnings);
    const existing = data.submissions.find(
      (s) =>
        s.userId === user.id &&
        s.studyId === id &&
        (s.status === "in_progress" || s.status === "pending_review" || s.status === "approved"),
    );
    let submission = existing ?? null;
    if (!existing && allowed) {
      submission = {
        id: newId("sub"),
        userId: user.id,
        studyId: id,
        status: "in_progress" as const,
        answers: {},
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: null,
        reviewedAt: null,
        rejectionReason: null,
        autoApproveAt: null,
      };
      data.submissions.push(submission);
      markDirty();
    }
    return {
      study: {
        ...study,
        kindLabel: kindLabel(study.kind),
      },
      submission,
      canStart: allowed,
      lockReason: allowed ? null : studyLockReason(user, study.tier, level, earnings),
    };
  }, false);
}
