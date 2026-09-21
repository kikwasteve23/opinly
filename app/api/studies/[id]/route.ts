import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { loadStudyForUser } from "@/lib/study-service";
import { mutateStore } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const payload = await loadStudyForUser(auth.user, id);
  if (!payload) return NextResponse.json({ error: "Study not found." }, { status: 404 });
  return NextResponse.json(payload);
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
