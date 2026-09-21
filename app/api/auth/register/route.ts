import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { mutateStore, newId } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import { OPEN_COUNTRIES } from "@/lib/onboarding-data";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  country: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email, a password of at least 8 characters, and your country." }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  if (!OPEN_COUNTRIES.includes(parsed.data.country)) {
    return NextResponse.json(
      { error: "We are not recruiting in that country right now. Check back as new studies open." },
      { status: 400 },
    );
  }

  const user = await mutateStore(async (data) => {
    if (data.users.some((u) => u.email === email)) {
      throw new Error("exists");
    }
    const created = {
      id: newId("usr"),
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      createdAt: new Date().toISOString(),
      profile: null,
      englishPassed: false,
      englishWriting: "",
      identityStatus: "not_started" as const,
      identityNote: "",
      onboardingStep: "profile" as const,
      available: 0,
      pending: 0,
      withdrawn: 0,
      payout: { network: "usdt_trc20" as const, address: "", addressChangedAt: null },
      lastWithdrawalAt: null,
    };
    data.users.push(created);
    return created;
  }).catch((err: Error) => {
    if (err.message === "exists") return null;
    throw err;
  });

  if (!user) {
    return NextResponse.json({ error: "An account with that email already exists. Log in instead." }, { status: 409 });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
