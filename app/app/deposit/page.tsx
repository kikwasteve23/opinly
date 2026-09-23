import { redirect } from "next/navigation";
import { DepositDesk } from "@/components/deposit-flow";
import { requireCompleteUser } from "@/lib/auth-actions";
import { MIN_WITHDRAWAL } from "@/lib/money";
import { resolveCountry } from "@/lib/resolve-geo";
import { readStoreSnapshot } from "@/lib/store";

export default async function DepositPage() {
  const user = await requireCompleteUser();
  if (user.available < MIN_WITHDRAWAL) redirect("/app/wallet");
  const country = await resolveCountry(user);
  const store = await readStoreSnapshot();
  const messages = store.chat.filter((m) => m.userId === user.id);
  return (
    <DepositDesk
      country={country}
      activated={user.walletActivated}
      availableUsd={user.available}
      messages={messages}
    />
  );
}
