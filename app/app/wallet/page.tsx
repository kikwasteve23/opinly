import { WalletPanel } from "@/components/wallet-panel";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";

export default async function WalletPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const withdrawals = store.withdrawals.filter((w) => w.userId === user.id);
  return (
    <WalletPanel
      initialUser={{
        available: user.available,
        pending: user.pending,
        withdrawn: user.withdrawn,
        payout: user.payout,
      }}
      initialHistory={withdrawals}
    />
  );
}
