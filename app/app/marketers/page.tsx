import { MarketerBoard } from "@/components/marketer-board";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";

export default async function MarketersPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const jobs = store.marketerJobs.filter((j) => j.userId === user.id);
  return <MarketerBoard available={user.available} jobs={jobs} />;
}
