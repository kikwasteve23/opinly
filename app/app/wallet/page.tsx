import { WalletPanel } from "@/components/wallet-panel";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { countsFromStore } from "@/lib/referrals";

export default async function WalletPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const withdrawals = store.withdrawals.filter((w) => w.userId === user.id);
  const { qualified, level } = countsFromStore(store, user.id);
  return (
    <WalletPanel
      initialUser={{
        available: user.available,
        pending: user.pending,
        withdrawn: user.withdrawn,
        walletActivated: user.walletActivated,
        payout: user.payout,
      }}
      initialHistory={withdrawals}
      referrals={{ qualified, level, code: user.referralCode }}
    />
  );
}
