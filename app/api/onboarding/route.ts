import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { mutateStore } from "@/lib/store";
import { publicUser } from "@/lib/session";
import { saveEnglishInStore, saveProfileInStore } from "@/lib/onboarding";

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;

  if (body.step === "profile") {
    const languages = Array.isArray(body.languages)
      ? body.languages.map((item) => String(item).trim()).filter(Boolean)
      : String(body.languages ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    const result = await mutateStore((data) =>
      saveProfileInStore(data, auth.user.id, {
        legalName: String(body.legalName ?? ""),
        dateOfBirth: String(body.dateOfBirth ?? ""),
        gender: String(body.gender ?? ""),
        country: String(body.country ?? ""),
        city: String(body.city ?? ""),
        region: String(body.region ?? ""),
        postalCode: String(body.postalCode ?? ""),
        languages,
        occupation: String(body.occupation ?? ""),
      }),
    );
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ user: publicUser(result.user) });
  }

  if (body.step === "english") {
    const answers =
      body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
        ? Object.fromEntries(Object.entries(body.answers as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
        : {};
    const result = await mutateStore((data) =>
      saveEnglishInStore(data, auth.user.id, { answers, writing: String(body.writing ?? "") }),
    );
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ user: publicUser(result.user) });
  }

  return NextResponse.json({ error: "Unknown step." }, { status: 400 });
}
