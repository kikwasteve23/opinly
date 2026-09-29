import { roundCents } from "./money";
import { newId } from "./ids";
import type { StoreData } from "./types";

export const SIGNUP_BONUS = 20;
export const REFERRAL_JOIN_BONUS = 3;

export function grantSignupBonus(data: StoreData, userId: string, now = new Date().toISOString()) {
  const user = data.users.find((u) => u.id === userId);
  if (!user || user.role !== "participant" || user.welcomeBonusAt) return false;
  user.available = roundCents(user.available + SIGNUP_BONUS);
  user.welcomeBonusAt = now;
  data.ledger.unshift({
    id: newId("led"),
    userId,
    amount: SIGNUP_BONUS,
    type: "adjustment",
    note: "Welcome bonus for joining Opinly",
    createdAt: now,
    adminEmail: null,
  });
  return true;
}

export function grantReferralJoinBonus(data: StoreData, newUserId: string, now = new Date().toISOString()) {
  const newbie = data.users.find((u) => u.id === newUserId);
  const sponsorId = newbie?.referredBy;
  if (!newbie || !sponsorId) return false;
  const already = data.ledger.some(
    (entry) => entry.userId === sponsorId && entry.note === `Referral bonus for ${newUserId}`,
  );
  if (already) return false;
  const sponsor = data.users.find((u) => u.id === sponsorId && u.role === "participant");
  if (!sponsor) return false;
  sponsor.available = roundCents(sponsor.available + REFERRAL_JOIN_BONUS);
  data.ledger.unshift({
    id: newId("led"),
    userId: sponsor.id,
    amount: REFERRAL_JOIN_BONUS,
    type: "adjustment",
    note: `Referral bonus for ${newUserId}`,
    createdAt: now,
    adminEmail: null,
  });
  return true;
}
