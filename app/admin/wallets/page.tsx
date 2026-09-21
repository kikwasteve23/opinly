import { redirect } from "next/navigation";

export default function AdminWalletsRedirect() {
  redirect("/admin/withdrawals");
}
