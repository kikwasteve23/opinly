import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getStudy, kindLabel } from "@/lib/studies-data";
import { mutateStore, newId } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const study = getStudy(id);
  if (!study) return NextResponse.json({ error: "Study not found." }, { status: 404 });

  const submission = await mutateStore((data) => {
    const existing = data.submissions.find(
      (s) => s.userId === auth.user.id && s.studyId === id && (s.status === "in_progress" || s.status === "pending_review" || s.status === "approved"),
    );
    if (existing) return existing;
    if (auth.user.identityStatus !== "approved") return null;
    const created = {
      id: newId("sub"),
      userId: auth.user.id,
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

  return NextResponse.json({
    study: {
      ...study,
      kindLabel: kindLabel(study.kind),
    },
    submission,
    canStart: auth.user.identityStatus === "approved",
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const body = (await request.json()) as { answers?: Record<string, string | string[]> };
  const submission = await mutateStore((data) => {
    const current = data.submissions.find((s) => s.userId === auth.user.id && s.studyId === id && s.status === "in_progress");
    if (!current) return null;
    current.answers = { ...current.answers, ...(body.answers ?? {}) };
    current.updatedAt = new Date().toISOString();
    return current;
  });
  if (!submission) return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  return NextResponse.json({ submission });
}
