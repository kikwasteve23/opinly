import { redirect } from "next/navigation";
import { WalletPanel } from "@/components/wallet-panel";
import { getSessionUser } from "@/lib/session";

export default async function WalletPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <WalletPanel
      initialUser={{
        available: user.available,
        pending: user.pending,
        withdrawn: user.withdrawn,
        payout: user.payout,
      }}
    />
  );
}
