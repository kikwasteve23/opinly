import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { mutateStore } from "./store";
import type { User } from "./types";

const COOKIE = "opinly_session";

function secret() {
  return new TextEncoder().encode(process.env.APP_SECRET ?? "opinly-dev-secret-change-me");
}

export async function signSession(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function setSessionCookie(userId: string) {
  const token = await signSession(userId);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = String(payload.sub ?? "");
    if (!userId) return null;
    return mutateStore((data) => data.users.find((u) => u.id === userId) ?? null);
  } catch {
    return null;
  }
}

export function publicUser(user: User) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}
