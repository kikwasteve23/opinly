import { WalletPanel } from "@/components/wallet-panel";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { countsFromStore } from "@/lib/referrals";
import { resolveCountry } from "@/lib/resolve-geo";
import { NOWPAYMENTS } from "@/lib/geo";

export default async function WalletPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const withdrawals = store.withdrawals.filter((w) => w.userId === user.id);
  const { qualified, level } = countsFromStore(store, user.id);
  const country = await resolveCountry(user);
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
      localLabel={`${country.name} (${country.currency})`}
      localMethods={`${country.local.name} and ${NOWPAYMENTS.name}`}
    />
  );
}
