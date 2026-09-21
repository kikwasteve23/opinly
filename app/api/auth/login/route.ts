import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { readStoreSnapshot } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const data = await readStoreSnapshot();
  const user = data.users.find((u) => u.email === email) ?? null;
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Those details do not match an account." }, { status: 401 });
  }
  if (user.accountStatus === "suspended") {
    return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
  }
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true, onboardingStep: user.onboardingStep, role: user.role });
}
