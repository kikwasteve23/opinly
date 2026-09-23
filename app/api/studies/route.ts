import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { kindLabel, questionCountLabel, tierLabel } from "@/lib/studies-data";
import { readStoreSnapshot } from "@/lib/store";
import { canAccessStudyTier, countsFromStore, studyEarningsUsd, studyVisibleOnDashboard } from "@/lib/referrals";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const data = await readStoreSnapshot();
  const submissions = data.submissions.filter((s) => s.userId === auth.user.id);
  const { level } = countsFromStore(data, auth.user.id);
  const earnings = studyEarningsUsd(data.studies, data.submissions, auth.user.id);
  const studies = data.studies
    .filter((study) => study.published)
    .filter((study) => {
      const started = submissions.some((s) => s.studyId === study.id);
      return studyVisibleOnDashboard(earnings, study.tier, started);
    })
    .map((study) => {
      const mine = submissions.filter((s) => s.studyId === study.id);
      const latest = mine.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      const open = canAccessStudyTier(auth.user, study.tier, level, earnings);
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
        status: latest?.status ?? "available",
        locked: !open,
      };
    });
  return NextResponse.json({ studies, level });
}
