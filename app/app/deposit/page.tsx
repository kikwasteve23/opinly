import { redirect } from "next/navigation";
import { DepositDesk } from "@/components/deposit-flow";
import { LiveRefresh } from "@/components/live-refresh";
import { requireCompleteUser } from "@/lib/auth-actions";
import { resolveCountry } from "@/lib/resolve-geo";
import { readStoreSnapshot } from "@/lib/store";
import { findMarketer } from "@/lib/marketers";
import { hitWalletCap } from "@/lib/referrals";
import { depositRail } from "@/lib/deposit-rails";
import { ensureDepositWelcome } from "@/lib/deposit-chat";

export default async function DepositPage({
  searchParams,
}: {
  searchParams: Promise<{ hire?: string; qty?: string; activate?: string }>;
}) {
  const user = await requireCompleteUser();
  const { hire: hireId, qty } = await searchParams;
  const marketer = hireId ? findMarketer(hireId) : null;
  const quantity = Number(qty);
  const hire =
    marketer && Number.isInteger(quantity) && quantity >= marketer.minOrder && quantity <= marketer.maxOrder
      ? { id: marketer.id, name: marketer.name, quantity, cost: Math.round(quantity * marketer.priceEach * 100) / 100 }
      : null;
  if (hire && !hitWalletCap(user)) redirect("/app");
  await ensureDepositWelcome(user.id);
  const store = await readStoreSnapshot();
  const country = await resolveCountry(user);
  const messages = store.chat.filter((m) => m.userId === user.id);
  const pending = store.deposits.find((d) => d.userId === user.id && d.status === "pending") ?? null;
  return (
    <>
    <LiveRefresh ms={3000} />
    <DepositDesk
      country={country}
      activated={user.walletActivated}
      availableUsd={user.available}
      messages={messages}
      hire={hire}
      pending={pending ? { amount: pending.amount, methodLabel: pending.methodLabel, purpose: pending.purpose } : null}
      localRail={depositRail(country.code, country.local.id)}
      cryptoRail={depositRail(country.code, "nowpayments")}
    />
    </>
  );
}
