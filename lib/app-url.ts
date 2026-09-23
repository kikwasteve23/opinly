import { headers } from "next/headers";

/** Public site origin. Strips a trailing /app if APP_URL was set to the dashboard. */
export async function publicOrigin() {
  const env = (process.env.APP_URL ?? "").trim().replace(/\/+$/, "").replace(/\/app$/i, "");
  if (env.startsWith("http://") || env.startsWith("https://")) return env;
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:43173";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function referralInviteUrl(code: string) {
  return `${await publicOrigin()}/register?ref=${encodeURIComponent(code)}`;
}
