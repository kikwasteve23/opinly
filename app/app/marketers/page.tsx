import { MarketerBoard } from "@/components/marketer-board";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { hitWalletCap } from "@/lib/referrals";
import { redirect } from "next/navigation";

export default async function MarketersPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  if (!hitWalletCap(user)) redirect("/app");
  const jobs = store.marketerJobs.filter((j) => j.userId === user.id);
  return <MarketerBoard jobs={jobs} />;
}
