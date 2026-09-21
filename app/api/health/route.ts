import { NextResponse } from "next/server";
import { pingDatabase, databaseUrl } from "@/lib/db/postgres";

export async function GET() {
  try {
    const db = databaseUrl() ? await pingDatabase() : { connected: false as const, skipped: true };
    return NextResponse.json({
      ok: true,
      service: "opinly",
      database: databaseUrl() ? (db.connected ? "postgres" : "error") : "file",
    });
  } catch {
    return NextResponse.json({ ok: false, service: "opinly", database: "error" }, { status: 500 });
  }
}
