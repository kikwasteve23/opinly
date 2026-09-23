import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { mutateStore } from "@/lib/store";
import { publicUser } from "@/lib/session";
import { submitStudyInStore } from "@/lib/submit-study";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  const result = await mutateStore((data) => submitStudyInStore(data, auth.user.id, id));

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    submission: result.submission,
    user: publicUser(result.user!),
  });
}
