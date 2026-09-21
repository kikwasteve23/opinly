import { StudyRunner } from "@/components/study-runner";

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudyRunner studyId={id} />;
}
