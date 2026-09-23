import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { isFinishedStudy, kindLabel, latestUserSubmission, questionCountLabel, tierLabel } from "@/lib/studies-data";
import { readStoreSnapshot } from "@/lib/store";
import { canAccessStudyTier, countsFromStore, studyEarningsUsd, studyVisibleOnDashboard } from "@/lib/referrals";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const data = await readStoreSnapshot();
  const submissions = data.submissions.filter((s) => s.userId === auth.user.id);
  const { level } = countsFromStore(data, auth.user.id);
  const earnings = studyEarningsUsd(data.studies, data.submissions, auth.user.id);

  function payload(study: (typeof data.studies)[number], status: string, locked: boolean) {
    return {
      id: study.id,
      title: study.title,
      summary: study.summary,
      kind: study.kind,
      kindLabel: kindLabel(study.kind),
      tier: study.tier,
      tierLabel: tierLabel(study.tier),
      reward: study.reward,
      minutes: study.minutes,
      questionCount: study.questions.length,
      questionCountLabel: questionCountLabel(study.questions.length),
      format: study.format,
      device: study.device,
      status,
      locked,
    };
  }

  const open = data.studies.filter((study) => {
    if (!study.published) return false;
    const latest = latestUserSubmission(submissions, study.id);
    if (isFinishedStudy(latest?.status)) return false;
    return studyVisibleOnDashboard(earnings, study.tier, Boolean(latest));
  });

  const history = data.studies
    .filter((study) => isFinishedStudy(latestUserSubmission(submissions, study.id)?.status))
    .map((study) => {
      const latest = latestUserSubmission(submissions, study.id);
      return payload(study, latest?.status ?? "approved", true);
    });

  const studies = open.map((study) => {
    const latest = latestUserSubmission(submissions, study.id);
    const openAccess = canAccessStudyTier(auth.user, study.tier, level, earnings);
    return payload(study, latest?.status ?? "available", !openAccess);
  });

  return NextResponse.json({ studies, history, level });
}
