import { DEPOSIT_WELCOME } from "./deposit-rails";
import { mutateStore, newId } from "./store";

export async function ensureDepositWelcome(userId: string) {
  await mutateStore((data) => {
    if (data.chat.some((m) => m.userId === userId)) return;
    data.chat.push({
      id: newId("msg"),
      userId,
      from: "support",
      body: DEPOSIT_WELCOME,
      createdAt: new Date().toISOString(),
      adminName: "Ada",
    });
  });
}

export function waitingDepositThreadCount(chat: { userId: string; from: string }[]) {
  const last = new Map<string, { from: string }>();
  for (const msg of chat) last.set(msg.userId, msg);
  return [...last.values()].filter((m) => m.from === "user").length;
}
