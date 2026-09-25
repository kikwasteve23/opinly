import { cookies } from "next/headers";

export const DEVICE_COOKIE = "opinly_device";
export const MAX_ACCOUNTS_PER_DEVICE = 3;
export const DEVICE_LIMIT_MESSAGE = "This device cannot be used to register more than three accounts.";

function cookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  };
}

export function isDeviceId(value: string) {
  return /^[a-z0-9-]{8,80}$/i.test(value.trim());
}

export async function ensureDeviceCookie() {
  const jar = await cookies();
  let id = jar.get(DEVICE_COOKIE)?.value ?? "";
  if (!isDeviceId(id)) {
    id = crypto.randomUUID();
    jar.set(DEVICE_COOKIE, id, cookieOptions());
  }
  return id;
}

export async function readDeviceIds(extra?: string | null) {
  const jar = await cookies();
  const ids = new Set<string>();
  const cookieId = jar.get(DEVICE_COOKIE)?.value;
  if (cookieId && isDeviceId(cookieId)) ids.add(cookieId);
  const extraId = (extra ?? "").trim();
  if (extraId && isDeviceId(extraId)) ids.add(extraId);
  return [...ids];
}

export function accountsOnDevice(users: { role?: string; deviceIds?: string[] }[], deviceIds: string[]) {
  const set = new Set(deviceIds);
  if (set.size === 0) return 0;
  return users.filter((user) => user.role !== "admin" && (user.deviceIds ?? []).some((id) => set.has(id))).length;
}
