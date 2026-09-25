import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "./session";

export async function requireUser(request?: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  return { user, public: publicUser(user) };
}
