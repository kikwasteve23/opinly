import { WalletPanel } from "@/components/wallet-panel";
import { requireCompleteUser } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";
import { qualifiedReferralCount, REFERRAL_REQUIREMENT } from "@/lib/referrals";

export default async function WalletPage() {
  const user = await requireCompleteUser();
  const store = await readStoreSnapshot();
  const withdrawals = store.withdrawals.filter((w) => w.userId === user.id);
  const qualified = qualifiedReferralCount(store.users, user.id);
  return (
    <WalletPanel
      initialUser={{
        available: user.available,
        pending: user.pending,
        withdrawn: user.withdrawn,
        payout: user.payout,
      }}
      initialHistory={withdrawals}
      referrals={{ qualified, required: REFERRAL_REQUIREMENT, code: user.referralCode }}
    />
  );
}
