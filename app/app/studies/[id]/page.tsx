import { notFound } from "next/navigation";
import { StudyRunner } from "@/components/study-runner";
import { requireCompleteUser } from "@/lib/auth-actions";
import { loadStudyForUser } from "@/lib/study-service";

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompleteUser();
  const { id } = await params;
  const initial = await loadStudyForUser(user, id);
  if (!initial) notFound();
  return <StudyRunner studyId={id} initial={initial} />;
}
