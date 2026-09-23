import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { kindLabel, tierLabel } from "@/lib/studies-data";
import { readStoreSnapshot } from "@/lib/store";
import { canAccessStudyTier, countsFromStore } from "@/lib/referrals";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const data = await readStoreSnapshot();
  const submissions = data.submissions.filter((s) => s.userId === auth.user.id);
  const { level } = countsFromStore(data, auth.user.id);
  const studies = data.studies
    .filter((study) => study.published)
    .map((study) => {
      const mine = submissions.filter((s) => s.studyId === study.id);
      const latest = mine.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      const open = canAccessStudyTier(auth.user, study.tier, level);
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
        format: study.format,
        device: study.device,
        status: latest?.status ?? "available",
        locked: !open,
      };
    });
  return NextResponse.json({ studies, level });
}
