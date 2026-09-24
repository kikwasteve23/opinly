"use server";

import { revalidatePath } from "next/cache";
import { requireCompleteUser } from "@/lib/auth-actions";
import { mutateStore } from "@/lib/store";

export async function dismissMilestoneAction(id: string) {
  const user = await requireCompleteUser();
  if (!id.trim()) return;
  await mutateStore((data) => {
    const current = data.users.find((u) => u.id === user.id);
    if (!current) return;
    if (!current.dismissedMilestones.includes(id)) current.dismissedMilestones.push(id);
  });
  revalidatePath("/app");
  revalidatePath("/app/wallet");
  revalidatePath("/app/marketers");
  revalidatePath("/app/deposit");
}
