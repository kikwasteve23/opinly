import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MilestonePopup } from "@/components/milestone-popup";
import { getSessionUser } from "@/lib/session";
import { MIN_WITHDRAWAL } from "@/lib/money";
import { resolveCountry } from "@/lib/resolve-geo";
import { countsFromStore, hitWalletCap } from "@/lib/referrals";
import { readStoreSnapshot } from "@/lib/store";
import { visibleMilestone } from "@/lib/milestones";

export default async function LoggedInLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.onboardingStep !== "complete") redirect("/onboarding");
  const country = await resolveCountry(user);
  const store = await readStoreSnapshot();
  const { qualified } = countsFromStore(store, user.id);
  const approvedStudies = store.submissions.filter((s) => s.userId === user.id && s.status === "approved").length;
  const milestone = visibleMilestone({ user, qualified, approvedStudies });
  const cashoutReady = user.available >= MIN_WITHDRAWAL;
  return (
    <AppShell
      email={user.email}
      photoUrl={user.photoUrl}
      showDeposit={cashoutReady}
      showReferralTools={hitWalletCap(user)}
      locationLabel={`${country.name} · ${country.currency}`}
      walletActivated={user.walletActivated}
      cashoutReady={cashoutReady}
    >
      <MilestonePopup milestone={milestone} />
      {children}
    </AppShell>
  );
}
