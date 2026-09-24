"use server";

import { revalidatePath } from "next/cache";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore } from "@/lib/store";

export type ProfileMediaState = { error?: string; ok?: string } | null;

async function readImage(file: File | null) {
  if (!file || file.size === 0) return { error: "Choose an image first." };
  if (!file.type.startsWith("image/")) return { error: "Use a JPG, PNG, or WebP photo." };
  if (file.size > 1_500_000) return { error: "Keep the photo under 1.5 MB." };
  const buffer = Buffer.from(await file.arrayBuffer());
  return { url: `data:${file.type};base64,${buffer.toString("base64")}` };
}

export async function uploadProfilePhotoAction(_prev: ProfileMediaState, formData: FormData): Promise<ProfileMediaState> {
  const user = await requireCompleteUser();
  const parsed = await readImage(formData.get("photo") as File | null);
  if ("error" in parsed) return { error: parsed.error };
  await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return;
    current.photoUrl = parsed.url;
  });
  revalidatePath("/app/profile");
  return { ok: "Profile photo saved." };
}

export async function submitOptionalIdAction(_prev: ProfileMediaState, formData: FormData): Promise<ProfileMediaState> {
  const user = await requireCompleteUser();
  const documentType = String(formData.get("documentType") ?? "").trim();
  const issuingCountry = String(formData.get("issuingCountry") ?? "").trim();
  const consent = String(formData.get("consent") ?? "") === "on";
  if (!documentType || !issuingCountry || !consent) {
    return { error: "Choose a document, country, and confirm we may review it." };
  }
  const parsed = await readImage(formData.get("idPhoto") as File | null);
  if ("error" in parsed) return { error: parsed.error };
  await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return;
    current.identityStatus = "pending";
    current.identityNote = `${documentType} · ${issuingCountry}. Waiting for an admin to review.`;
    current.identityImageUrl = parsed.url;
  });
  revalidatePath("/app/profile");
  revalidatePath("/admin/applicants");
  return { ok: "ID submitted for review. You can keep taking studies while you wait." };
}
