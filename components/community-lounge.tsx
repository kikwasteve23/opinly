"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { LOUNGE_LINES, LOUNGE_PERSONAS, loungeDelayMs, type LoungePersona } from "@/lib/lounge-script";

type Line = {
  id: string;
  persona: LoungePersona;
  text: string;
  at: number;
};

function personaById(id: string) {
  return LOUNGE_PERSONAS.find((p) => p.id === id) ?? LOUNGE_PERSONAS[0];
}

function seedLines(now: number): Line[] {
  return LOUNGE_LINES.slice(0, 6).map((line, index) => ({
    id: `seed-${index}`,
    persona: personaById(line.speaker),
    text: line.text,
    at: now - (6 - index) * 50_000,
  }));
}

export function CommunityLounge() {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState<LoungePersona | null>(null);
  const [lines, setLines] = useState<Line[]>(() => seedLines(Date.now()));
  const bottomRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const cursorRef = useRef(6);
  openRef.current = open;

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const schedule = (ms: number, fn: () => void) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fn, ms);
    };
    const postNext = () => {
      if (cancelled) return;
      const next = LOUNGE_LINES[cursorRef.current % LOUNGE_LINES.length];
      const speaker = personaById(next.speaker);
      if (openRef.current) setTyping(speaker);
      schedule(openRef.current ? 800 + Math.random() * 900 : 120, () => {
        if (cancelled) return;
        setLines((prev) => {
          const row: Line = {
            id: `${Date.now()}-${cursorRef.current}`,
            persona: speaker,
            text: next.text,
            at: Date.now(),
          };
          return [...prev, row].slice(-40);
        });
        cursorRef.current += 1;
        setTyping(null);
        schedule(loungeDelayMs(), postNext);
      });
    };
    schedule(loungeDelayMs(), postNext);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, typing, open]);

  const online = useMemo(() => 18 + (lines.length % 7), [lines.length]);

  return (
    <>
      {open ? (
        <div className="fixed right-4 bottom-24 z-40 flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-indigo-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Opinly lounge</p>
              <p className="text-xs text-indigo-100">{online} in the room · talking about the platform</p>
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
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {line.persona.name}{" "}
                    <span className="font-normal text-gray-400">{line.persona.city}</span>
                  </p>
                  <p className="mt-0.5 rounded-2xl rounded-tl-sm bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {line.text}
                  </p>
                </div>
              </div>
            ))}
            {typing ? (
              <p className="px-2 text-xs text-gray-500">{typing.name} is typing…</p>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <p className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-500 dark:border-gray-800">
            Lounge chat is for members. Bots keep the room on Opinly — benefits, studies, and how it helps people.
          </p>
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
