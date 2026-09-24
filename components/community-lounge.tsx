"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { ACTIVATION_DEPOSIT } from "@/lib/money";
import {
  loungeGapMs,
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

export function CommunityLounge({ walletActivated }: { walletActivated: boolean }) {
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joined, setJoined] = useState(walletActivated);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<LoungePersona | null>(null);
  const [lines, setLines] = useState<Line[]>(() =>
    seedLoungePosts().map((row, i) => toLine(row.post, `seed-${i}`)),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const usedThreads = useRef<string[]>(["pending"]);
  const seq = useRef(0);
  openRef.current = open;

  useEffect(() => {
    if (walletActivated) setJoined(true);
  }, [walletActivated]);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(resolve, ms);
      });
    const push = (post: LoungePost) => {
      seq.current += 1;
      setLines((prev) => [...prev, toLine(post, `${Date.now()}-${seq.current}`)].slice(-48));
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
        await wait(loungeGapMs(openRef.current));
        if (cancelled) return;
        const event = pickLoungeEvent(usedThreads.current);
        if (event.kind === "chatter") {
          await speak(event.post);
          continue;
        }
        usedThreads.current = [...usedThreads.current, event.thread.id].slice(-LOUNGE_THREAD_CAP);
        await speak(event.thread.question);
        const replies = repliesForThread(event.thread);
        for (const reply of replies) {
          await wait(1400 + Math.random() * 3200);
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

  const online = useMemo(() => 22 + ((lines.length * 3) % 11), [lines.length]);

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
        persona: { id: "you", name: "You", city: "here", color: "bg-gray-700", role: "member" as const },
        text,
      },
    ].slice(-48));
  }

  return (
    <>
      {open ? (
        <div className="fixed right-4 bottom-24 z-40 flex h-[min(32rem,74vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-indigo-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Opinly lounge</p>
              <p className="text-xs text-indigo-100">{online} in the room</p>
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
                    {line.persona.name}
                    {line.persona.role === "admin" ? (
                      <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800">
                        Admin
                      </span>
                    ) : (
                      <span className="font-normal text-gray-400"> · {line.persona.city}</span>
                    )}
                  </p>
                  <p className="mt-0.5 rounded-2xl rounded-tl-sm bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {line.text}
                  </p>
                </div>
              </div>
            ))}
            {typing ? (
              <p className="px-2 text-xs text-gray-500">
                {typing.name}
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
              <button
                type="button"
                onClick={onJoin}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Join the chat
              </button>
            )}
          </div>
        </div>
      ) : null}

      {joinOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-bold">Activate to join the lounge</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              You need a verified, activated account before you can post. Activate with a ${ACTIVATION_DEPOSIT} deposit.
              That ${ACTIVATION_DEPOSIT} is added to your wallet and you can take it out with your first withdrawal — we
              do not keep it as a fee.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => setJoinOpen(false)}>
                Not now
              </button>
              <Link
                href="/app/deposit?activate=1"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Activate account
              </Link>
            </div>
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

const LOUNGE_THREAD_CAP = 8;
