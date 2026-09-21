import { NextResponse } from "next/server";
import { pingDatabase, databaseUrl } from "@/lib/db/postgres";

export async function GET() {
  const url = databaseUrl();
  try {
    if (!url) {
      return NextResponse.json({
        ok: true,
        service: "opinly",
        database: "file",
        hint: "Set DATABASE_URL on Render to your Neon connection string. Until then, data is not stored in Postgres.",
      });
    }
    const db = await pingDatabase();
    return NextResponse.json({
      ok: db.connected,
      service: "opinly",
      database: db.connected ? "postgres" : "error",
      neon: url.includes("neon.tech"),
    });
  } catch {
    return NextResponse.json({ ok: false, service: "opinly", database: "error" }, { status: 500 });
  }
}
