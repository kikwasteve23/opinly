import { DepositDesk } from "@/components/deposit-desk";
import { requireAdmin } from "@/lib/auth-actions";
import { readStoreSnapshot } from "@/lib/store";

export default async function AdminDepositsPage() {
  await requireAdmin();
  const store = await readStoreSnapshot();
  const people = store.users
    .filter((u) => u.role === "participant")
    .map((u) => ({ id: u.id, email: u.email, available: u.available, name: u.profile?.legalName || u.email }));
  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold">Deposits</h1>
      <p className="mb-6 text-sm text-gray-600">Manual credits and debits against participant wallets, with a ledger you can audit.</p>
      <DepositDesk people={people} ledger={store.ledger} />
    </div>
  );
}
