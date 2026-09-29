import { requireAdmin } from "@/lib/auth-actions";
import { AdminShell } from "@/components/admin-shell";
import { readStoreSnapshot } from "@/lib/store";
import { waitingDepositThreadCount } from "@/lib/deposit-chat";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const store = await readStoreSnapshot();
  const waitingChats = waitingDepositThreadCount(store.chat);
  return (
    <AdminShell email={admin.email} waitingChats={waitingChats}>
      {children}
    </AdminShell>
  );
}
