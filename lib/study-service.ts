import { findStudy, kindLabel } from "./studies-data";
import { mutateStore, newId, readStoreSnapshot } from "./store";
import { canAccessStudyTier, countsFromStore, studyEarningsUsd, studyLockReason } from "./referrals";
import type { User } from "./types";

export async function loadStudyForUser(user: User, id: string) {
  const snapshot = await readStoreSnapshot();
  const study = findStudy(snapshot.studies, id);
  if (!study || !study.published) return null;
  const { level } = countsFromStore(snapshot, user.id);
  const earnings = studyEarningsUsd(snapshot.studies, snapshot.submissions, user.id);
  const allowed = canAccessStudyTier(user, study.tier, level, earnings);
  const submission = await mutateStore((data) => {
    const existing = data.submissions.find(
      (s) =>
        s.userId === user.id &&
        s.studyId === id &&
        (s.status === "in_progress" || s.status === "pending_review" || s.status === "approved"),
    );
    if (existing) return existing;
    if (!allowed) return null;
    const created = {
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
    data.submissions.push(created);
    return created;
  });
  return {
    study: {
      ...study,
      kindLabel: kindLabel(study.kind),
    },
    submission,
    canStart: allowed,
    lockReason: allowed ? null : studyLockReason(user, study.tier, level, earnings),
  };
}
