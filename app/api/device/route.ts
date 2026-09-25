import { NextResponse } from "next/server";
import { ensureDeviceCookie } from "@/lib/device";

export async function GET() {
  const id = await ensureDeviceCookie();
  return NextResponse.json({ ok: true, id });
}
