import { notFound } from "next/navigation";
import { SurveyBuilder } from "@/components/survey-builder";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";

export default async function EditSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const store = await readStoreSnapshot();
  const study = store.studies.find((s) => s.id === id);
  if (!study) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Edit survey</h1>
      <SurveyBuilder initial={study} />
    </div>
  );
}
