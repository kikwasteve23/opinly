import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api";
import { applyWithdrawal } from "@/lib/withdraw";
import { publicUser } from "@/lib/session";
import { mutateStore } from "@/lib/store";

const schema = z.object({
  amount: z.number().positive(),
  network: z.enum(["usdt_trc20", "ltc"]),
  address: z.string().min(8),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter an amount, a network, and a payout address." }, { status: 400 });
  }

  const result = await mutateStore((data) => {
    const user = data.users.find((u) => u.id === auth.user.id);
    if (!user) return { error: "Account missing." };
    const applied = applyWithdrawal(data, user, parsed.data);
    if ("error" in applied) return { error: applied.error };
    return { user, withdrawal: applied.withdrawal };
  });

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: publicUser(result.user!), withdrawal: result.withdrawal });
}
