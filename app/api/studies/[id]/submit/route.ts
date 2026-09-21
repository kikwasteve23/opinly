import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getStudy } from "@/lib/studies-data";
import { mutateStore } from "@/lib/store";
import { publicUser } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  if (auth.user.identityStatus !== "approved") {
    return NextResponse.json({ error: "Identity verification has to clear before you can submit." }, { status: 403 });
  }
  const { id } = await context.params;
  const study = getStudy(id);
  if (!study) return NextResponse.json({ error: "Study not found." }, { status: 404 });

  const result = await mutateStore((data) => {
    const user = data.users.find((u) => u.id === auth.user.id);
    const submission = data.submissions.find((s) => s.userId === auth.user.id && s.studyId === id && s.status === "in_progress");
    if (!user || !submission) return { error: "Start the study before submitting." };

    for (const question of study.questions) {
      const answer = submission.answers[question.id];
      const empty = answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0);
      if (question.required && empty) {
        return { error: "Answer every required question before submitting." };
      }
      if (question.type === "attention" && question.correct) {
        const value = Array.isArray(answer) ? answer.join(" ") : String(answer ?? "");
        if (value.trim().toLowerCase() !== question.correct.toLowerCase()) {
          submission.status = "rejected";
          submission.submittedAt = new Date().toISOString();
          submission.reviewedAt = new Date().toISOString();
          submission.rejectionReason = "An attention check was missed.";
          return { submission, user };
        }
      }
    }

    const textAnswers = study.questions.filter((q) => q.type === "text");
    const thin = textAnswers.some((q) => String(submission.answers[q.id] ?? "").trim().length < 12);
    if (thin) {
      submission.status = "rejected";
      submission.submittedAt = new Date().toISOString();
      submission.reviewedAt = new Date().toISOString();
      submission.rejectionReason = "Written answers were too short to show genuine attention.";
      return { submission, user };
    }

    submission.status = "pending_review";
    submission.submittedAt = new Date().toISOString();
    submission.updatedAt = new Date().toISOString();
    user.pending = Math.round((user.pending + study.reward) * 100) / 100;

    return { submission, user };
  });

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    submission: result.submission,
    user: publicUser(result.user!),
  });
}
