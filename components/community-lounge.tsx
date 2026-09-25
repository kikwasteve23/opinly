"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import {
  firstNameOf,
  formatCount,
  loungeCensus,
  loungeGapMs,
  loungeLabel,
  personaById,
  pickLoungeEvent,
  repliesForThread,
  seedLoungePosts,
  typingMs,
  type LoungePersona,
  type LoungePost,
} from "@/lib/lounge-script";

type Line = {
  id: string;
  persona: LoungePersona;
  text: string;
};

function toLine(post: LoungePost, id: string): Line {
  return { id, persona: personaById(post.speaker), text: post.text };
}

export function CommunityLounge({ walletActivated, cashoutReady }: { walletActivated: boolean; cashoutReady: boolean }) {
  const pathname = usePathname();
  const hide = pathname.startsWith("/app/deposit");
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<LoungePersona | null>(null);
  const [census, setCensus] = useState(() => loungeCensus());
  const [lines, setLines] = useState<Line[]>(() => seedLoungePosts().map((post, i) => toLine(post, `seed-${i}`)));
  const bottomRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const usedThreads = useRef<string[]>(["join-fee"]);
  const recent = useRef<string[]>([]);
  const seq = useRef(0);
  openRef.current = open;

  useEffect(() => {
    if (!walletActivated) setJoined(false);
  }, [walletActivated, cashoutReady]);

  useEffect(() => {
    if (hide) {
      setOpen(false);
      setJoinOpen(false);
    }
  }, [hide]);

  useEffect(() => {
    const id = window.setInterval(() => setCensus(loungeCensus()), 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(resolve, ms);
      });
    const remember = (id: string) => {
      recent.current = [...recent.current, id].slice(-14);
    };
    const push = (post: LoungePost) => {
      seq.current += 1;
      remember(post.speaker);
      setLines((prev) => [...prev, toLine(post, `${Date.now()}-${seq.current}`)].slice(-60));
    };
    const speak = async (post: LoungePost) => {
      if (cancelled) return;
      const who = personaById(post.speaker);
      if (openRef.current) setTyping(who);
      await wait(typingMs(post.text));
      if (cancelled) return;
      setTyping(null);
      push(post);
    };
    const loop = async () => {
      while (!cancelled) {
        await wait(loungeGapMs());
        if (cancelled) return;
        const event = pickLoungeEvent(usedThreads.current, recent.current);
        if (event.kind === "chatter") {
          await speak(event.post);
          continue;
        }
        usedThreads.current = [...usedThreads.current, event.thread.id].slice(-10);
        await speak({ speaker: event.asker, text: event.thread.question });
        const replies = repliesForThread(event.thread, recent.current);
        for (const reply of replies) {
          await wait(loungeGapMs());
          if (cancelled) return;
          await speak(reply);
        }
      }
    };
    void loop();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, typing, open]);

  if (hide) return null;

  function onJoin() {
    if (walletActivated) {
      setJoined(true);
      return;
    }
    setJoinOpen(true);
  }

  function sendOwn(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !joined) return;
    setDraft("");
    seq.current += 1;
    setLines((prev) => [
      ...prev,
      {
        id: `you-${seq.current}`,
                    persona: {
                      id: "you",
                      name: "You",
                      firstName: "You",
                      flag: "",
                      country: "",
                      color: "bg-gray-700",
                      role: "member" as const,
                    },
        text,
      },
    ].slice(-60));
  }

  return (
    <>
      {open ? (
        <div className="fixed right-4 bottom-24 z-40 flex h-[min(32rem,74vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-indigo-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Opinly lounge</p>
              <p className="text-xs text-indigo-100">
                {formatCount(census.total)} members · {formatCount(census.online)} online
              </p>
            </div>
            <button type="button" className="rounded-lg p-1 hover:bg-indigo-500" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {lines.map((line) => (
              <div key={line.id} className="flex gap-2">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${line.persona.color}`}>
                  {line.persona.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {loungeLabel(line.persona)}
                    {line.persona.role === "admin" ? (
                      <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800">
                        Admin
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 rounded-2xl rounded-tl-sm bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {line.text}
                  </p>
                </div>
              </div>
            ))}
            {typing ? (
              <p className="px-2 text-xs text-gray-500">
                {firstNameOf(typing)}
                {typing.role === "admin" ? " (admin)" : ""} is typing…
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-gray-100 p-3 dark:border-gray-800">
            {joined ? (
              <form onSubmit={sendOwn} className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Say something about Opinly…"
                  className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                />
                <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Send</button>
              </form>
            ) : (
              <button type="button" onClick={onJoin} className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
                Join the chat
              </button>
            )}
          </div>
        </div>
      ) : null}

      {joinOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            {cashoutReady ? (
              <>
                <h2 className="text-lg font-bold">Congratulations</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Congratulations on reaching the minimum withdrawal limit of $500. Kindly activate your account to join
                  the chat.
                </p>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => setJoinOpen(false)}>
                    Later
                  </button>
                  <Link
                    href="/app/deposit?activate=1"
                    onClick={() => {
                      setOpen(false);
                      setJoinOpen(false);
                      setTyping(null);
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Activate account
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">Keep going</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  The lounge is for people who have reached the $500 cash-out threshold. Keep taking studies and work
                  toward that minimum — then you can activate and join the chat.
                </p>
                <div className="mt-5 flex justify-end">
                  <button type="button" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => setJoinOpen(false)}>
                    Later
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" /> : null}
      </button>
    </>
  );
}
