import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { makeReferralCode, mutateStore, newId, normalizeUser } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import { OPEN_COUNTRIES } from "@/lib/onboarding-data";
import { countryFromName } from "@/lib/geo";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  country: z.string().min(1),
  referralCode: z.string().optional(),
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
    const code = parsed.data.referralCode?.trim().toUpperCase();
    let referredBy: string | null = null;
    if (code) {
      const sponsor = data.users.find((u) => u.referralCode === code && u.role === "participant");
      if (!sponsor) throw new Error("bad_code");
      referredBy = sponsor.id;
    }
    const created = normalizeUser({
      id: newId("usr"),
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      referralCode: makeReferralCode(),
      referredBy,
      detectedCountry: countryFromName(parsed.data.country).code,
    });
    data.users.push(created);
    return created;
  }).catch((err: Error) => {
    if (err.message === "exists" || err.message === "bad_code") return err.message;
    throw err;
  });

  if (user === "exists") {
    return NextResponse.json({ error: "An account with that email already exists. Log in instead." }, { status: 409 });
  }
  if (user === "bad_code") {
    return NextResponse.json({ error: "That referral code is not recognised." }, { status: 400 });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
