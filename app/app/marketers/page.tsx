import { MarketerBoard } from "@/components/marketer-board";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { hitStudyEarningsCap, studyEarningsUsd } from "@/lib/referrals";
import { redirect } from "next/navigation";

export default async function MarketersPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  if (!hitStudyEarningsCap(studyEarningsUsd(store.studies, store.submissions, user.id))) redirect("/app");
  const jobs = store.marketerJobs.filter((j) => j.userId === user.id);
  return <MarketerBoard jobs={jobs} />;
}
