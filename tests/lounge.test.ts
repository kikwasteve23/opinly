import { describe, expect, it } from "vitest";
import { pickLoungeEvent, repliesForThread, LOUNGE_ADMIN, LOUNGE_THREADS } from "../lib/lounge-script";

describe("lounge conversation", () => {
  it("asks unused questions and lets admin or a peer answer", () => {
    const event = pickLoungeEvent([], () => 0.1);
    expect(event.kind).toBe("question");
    if (event.kind !== "question") return;
    const replies = repliesForThread(event.thread, () => 0.9);
    expect(replies.length).toBeGreaterThanOrEqual(1);
    const adminThread = LOUNGE_THREADS.find((t) => t.answerer === "admin")!;
    const adminReplies = repliesForThread(adminThread, () => 0.99);
    expect(adminReplies[0]?.speaker).toBe(LOUNGE_ADMIN.id);
  });

  it("falls back to chatter when no questions remain", () => {
    const used = LOUNGE_THREADS.map((t) => t.id);
    const event = pickLoungeEvent(used, () => 0.1);
    expect(event.kind).toBe("chatter");
  });
});
