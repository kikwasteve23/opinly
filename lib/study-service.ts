import { getStudy, kindLabel } from "./studies-data";
import { mutateStore, newId } from "./store";
import type { User } from "./types";

export async function loadStudyForUser(user: User, id: string) {
  const study = getStudy(id);
  if (!study) return null;
  const submission = await mutateStore((data) => {
    const existing = data.submissions.find(
      (s) =>
        s.userId === user.id &&
        s.studyId === id &&
        (s.status === "in_progress" || s.status === "pending_review" || s.status === "approved"),
    );
    if (existing) return existing;
    if (user.identityStatus !== "approved") return null;
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
    };
    data.submissions.push(created);
    return created;
  });
  return {
    study: { ...study, kindLabel: kindLabel(study.kind) },
    submission,
    canStart: user.identityStatus === "approved",
  };
}
