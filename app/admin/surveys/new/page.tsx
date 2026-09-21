import { SurveyBuilder } from "@/components/survey-builder";
import { requireAdmin } from "@/lib/auth-actions";

export default async function NewSurveyPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Create a survey</h1>
      <SurveyBuilder />
    </div>
  );
}
