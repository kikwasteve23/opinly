import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { mutateStore } from "@/lib/store";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const withdrawals = await mutateStore((data) => data.withdrawals.filter((w) => w.userId === auth.user.id));
  return NextResponse.json({ withdrawals, user: auth.public });
}
