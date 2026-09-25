import { describe, expect, it } from "vitest";
import {
  pickLoungeEvent,
  repliesForThread,
  LOUNGE_ADMINS,
  LOUNGE_MEMBERS,
  LOUNGE_THREADS,
  LOUNGE_CHATTER,
  loungeCensus,
  loungeGapMs,
  loungeLabel,
  firstNameOf,
  typingMs,
} from "../lib/lounge-script";
import { flagEmoji } from "../lib/lounge-people";

describe("lounge conversation", () => {
  it("asks unused questions and lets admin or a peer answer", () => {
    const event = pickLoungeEvent([], [], () => 0.1);
    expect(event.kind).toBe("question");
    if (event.kind !== "question") return;
    const replies = repliesForThread(event.thread, [], () => 0.2);
    expect(replies.length).toBeGreaterThanOrEqual(1);
    const adminThread = LOUNGE_THREADS.find((t) => t.answerer === "admin")!;
    const adminReplies = repliesForThread(adminThread, [], () => 0.01);
    expect(LOUNGE_ADMINS.some((a) => a.id === adminReplies[0]?.speaker)).toBe(true);
  });

  it("falls back to chatter when no questions remain", () => {
    const used = LOUNGE_THREADS.map((t) => t.id);
    const event = pickLoungeEvent(used, [], () => 0.1);
    expect(event.kind).toBe("chatter");
  });

  it("uses a wide name pool and keeps census above launch floors", () => {
    expect(LOUNGE_MEMBERS.length).toBeGreaterThan(2000);
    const mamello = LOUNGE_MEMBERS.find((m) => m.name.toLowerCase() === "mamello molefe");
    expect(mamello?.country).toBe("ZA");
    expect(loungeLabel(mamello!)).toBe(`mamello molefe. ${flagEmoji("ZA")}`);
    expect(firstNameOf(mamello!)).toBe("mamello");
    expect(flagEmoji("ZA")).toBe("🇿🇦");
    expect(loungeGapMs(() => 0)).toBe(10_000);
    expect(loungeGapMs(() => 1)).toBe(90_000);
    const names = new Set(LOUNGE_MEMBERS.map((m) => m.name));
    expect(names.size).toBe(LOUNGE_MEMBERS.length);
    const { total, online } = loungeCensus();
    expect(total).toBeGreaterThan(10_000);
    expect(online).toBeGreaterThan(200);
    expect(typingMs("Hi")).toBeLessThan(12_000);
    expect(typingMs("x".repeat(200), () => 0)).toBeGreaterThanOrEqual(30_000);
    expect(LOUNGE_ADMINS).toHaveLength(1);
    expect(LOUNGE_ADMINS[0]?.name).toBe("Support");
    expect(loungeLabel(LOUNGE_ADMINS[0]!)).toBe("Support");
    const threadBlob = [...LOUNGE_THREADS.map((t) => `${t.question} ${t.adminText ?? ""} ${t.peerText ?? ""}`), ...LOUNGE_CHATTER]
      .join(" ")
      .toLowerCase();
    expect(threadBlob).not.toMatch(/deposit/);
    expect(threadBlob).not.toMatch(/activat/);
    expect(threadBlob).not.toMatch(/\bmalik\b/);
    expect(threadBlob).not.toMatch(/\bada\b/);
  });
});
