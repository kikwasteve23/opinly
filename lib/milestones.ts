import { MIN_WITHDRAWAL } from "./money";
import { BRONZE_REFERRALS, GOLD_REFERRALS, PLATINUM_REFERRALS, hitWalletCap } from "./referrals";
import type { User } from "./types";

export type MilestoneCard = {
  id: string;
  title: string;
  body: string;
  nextLabel: string;
  nextHref: string;
};

export function visibleMilestone(input: {
  user: Pick<User, "available" | "pending" | "walletActivated" | "dismissedMilestones" | "identityStatus">;
  qualified: number;
  approvedStudies: number;
}): MilestoneCard | null {
  const dismissed = new Set(input.user.dismissedMilestones ?? []);
  const cards = achievedMilestones(input);
  return cards.find((card) => !dismissed.has(card.id)) ?? null;
}

export function achievedMilestones(input: {
  user: Pick<User, "available" | "pending" | "walletActivated" | "identityStatus">;
  qualified: number;
  approvedStudies: number;
}): MilestoneCard[] {
  const cards: MilestoneCard[] = [];
  if (input.user.available >= MIN_WITHDRAWAL) {
    cards.push(
      input.user.walletActivated
        ? {
            id: "cash500",
            title: "Congratulations — you reached the $500 mark",
            body: "Your available balance is ready for cash-out. The next step is to send a crypto withdrawal to a wallet you control.",
            nextLabel: "Go to wallet",
            nextHref: "/app/wallet",
          }
        : {
            id: "cash500",
            title: "Congratulations — you reached the $500 mark",
            body: "You can take your earnings out now. The next step is a $50 wallet activation. That $50 is added to your balance and goes out with your first withdrawal — it is not a fee we keep.",
            nextLabel: "Activate wallet",
            nextHref: "/app/deposit",
          },
    );
    if (input.user.identityStatus !== "approved") {
      cards.push({
        id: "verify",
        title: "One more step before payouts",
        body: "Identity checks keep withdrawals safe. Add a document from Profile when you are ready. It is optional until you cash out.",
        nextLabel: "Go to profile",
        nextHref: "/app/profile",
      });
    }
  }
  if (input.qualified >= PLATINUM_REFERRALS) {
    cards.push({
      id: "platinum",
      title: "Congratulations — Platinum unlocked",
      body: "You brought in 100 active referrals. Top-tier studies are open. Keep taking the ones you qualify for.",
      nextLabel: "See studies",
      nextHref: "/app",
    });
  } else if (input.qualified >= GOLD_REFERRALS) {
    cards.push({
      id: "gold",
      title: "Congratulations — Gold unlocked",
      body: "You reached 50 active referrals. Higher-paying Gold studies are waiting. 100 referrals unlock Platinum.",
      nextLabel: "See studies",
      nextHref: "/app",
    });
  } else if (input.qualified >= BRONZE_REFERRALS) {
    cards.push({
      id: "bronze",
      title: "Congratulations — Bronze unlocked",
      body: "Thank you for bringing 20 active referrals. Higher-paying studies are open. Keep going, or hire experts if you want a faster fill.",
      nextLabel: "See studies",
      nextHref: "/app",
    });
  }
  if (hitWalletCap(input.user)) {
    cards.push({
      id: "cap400",
      title: "Congratulations on earning $400",
      body: "You are now on the Bronze track. Bronze surveys unlock with 20 active referrals. Share your invite link, or hire marketers who can promote it — pay before they start, or pay after the referrals land.",
      nextLabel: "See marketers",
      nextHref: "/app/marketers",
    });
  }
  if (input.approvedStudies >= 1) {
    cards.push({
      id: "first_study",
      title: "Congratulations on your first approved study",
      body: "Your answers were accepted and the pay is in your wallet. Take the next study while it is still a match.",
      nextLabel: "Continue studies",
      nextHref: "/app",
    });
  }
  return cards;
}
