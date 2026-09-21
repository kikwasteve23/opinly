import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api";
import { ADDRESS_CHANGE_HOLD_MS, MIN_WITHDRAWAL, WITHDRAWAL_COOLDOWN_MS, quoteWithdrawal } from "@/lib/money";
import { publicUser } from "@/lib/session";
import { mutateStore, newId } from "@/lib/store";

const schema = z.object({
  amount: z.number().positive(),
  network: z.enum(["usdt_trc20", "ltc"]),
  address: z.string().min(8),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  if (auth.user.identityStatus !== "approved") {
    return NextResponse.json({ error: "Withdrawals open after identity verification is approved." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter an amount, a network, and a payout address." }, { status: 400 });
  }
  const quote = quoteWithdrawal(parsed.data.amount, parsed.data.network);
  if (!quote.valid) {
    return NextResponse.json({ error: `The minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(2)} after you cover fees.` }, { status: 400 });
  }

  const result = await mutateStore((data) => {
    const user = data.users.find((u) => u.id === auth.user.id);
    if (!user) return { error: "Account missing." };
    if (quote.requested > user.available) {
      return { error: "That is more than your available balance." };
    }
    const now = Date.now();
    if (user.lastWithdrawalAt && now - new Date(user.lastWithdrawalAt).getTime() < WITHDRAWAL_COOLDOWN_MS) {
      return { error: "You can request one withdrawal every 72 hours." };
    }
    if (user.payout.address && user.payout.address !== parsed.data.address && user.payout.addressChangedAt) {
      const held = now - new Date(user.payout.addressChangedAt).getTime() < ADDRESS_CHANGE_HOLD_MS;
      if (held) return { error: "Withdrawals pause for 24 hours after you change a payout address." };
    }
    if (user.payout.address && user.payout.address !== parsed.data.address) {
      user.payout.addressChangedAt = new Date().toISOString();
    }
    user.payout = {
      network: parsed.data.network,
      address: parsed.data.address.trim(),
      addressChangedAt: user.payout.addressChangedAt,
    };
    user.available = Math.round((user.available - quote.requested) * 100) / 100;
    user.withdrawn = Math.round((user.withdrawn + quote.requested) * 100) / 100;
    user.lastWithdrawalAt = new Date().toISOString();
    const withdrawal = {
      id: newId("wd"),
      userId: user.id,
      network: parsed.data.network,
      address: parsed.data.address.trim(),
      requested: quote.requested,
      platformFee: quote.platformFee,
      networkFee: quote.networkFee,
      arrives: quote.arrives,
      status: "processing" as const,
      createdAt: new Date().toISOString(),
    };
    data.withdrawals.unshift(withdrawal);
    return { user, withdrawal };
  });

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: publicUser(result.user!), withdrawal: result.withdrawal, quote });
}
