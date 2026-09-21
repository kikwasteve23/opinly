import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { STUDIES, kindLabel } from "@/lib/studies-data";
import { mutateStore } from "@/lib/store";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const submissions = await mutateStore((data) => data.submissions.filter((s) => s.userId === auth.user.id));
  const studies = STUDIES.map((study) => {
    const mine = submissions.filter((s) => s.studyId === study.id);
    const latest = mine.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return {
      id: study.id,
      title: study.title,
      summary: study.summary,
      kind: study.kind,
      kindLabel: kindLabel(study.kind),
      reward: study.reward,
      minutes: study.minutes,
      format: study.format,
      device: study.device,
      status: latest?.status ?? "available",
    };
  });
  return NextResponse.json({ studies });
}
