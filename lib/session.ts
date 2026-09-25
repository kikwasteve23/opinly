import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { readStoreSnapshot } from "./store";
import type { User } from "./types";

const COOKIE = "opinly_session";

function secret() {
  return new TextEncoder().encode(process.env.APP_SECRET ?? "opinly-dev-secret-change-me");
}

function tokenFromCookieHeader(header: string | null | undefined) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return rest.join("=");
  }
  return null;
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
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(request?: Request): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value ?? tokenFromCookieHeader(request?.headers.get("cookie"));
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = String(payload.sub ?? "");
    if (!userId) return null;
    const data = await readStoreSnapshot();
    return data.users.find((u) => u.id === userId) ?? null;
  } catch {
    return null;
  }
}

export function publicUser(user: User) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}
