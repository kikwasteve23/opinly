"use client";

import { useEffect } from "react";
import { INACTIVITY_MS } from "@/lib/money";

const KEY = "opinly_last_activity";

export function InactivityGuard() {
  useEffect(() => {
    const bump = () => {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    };
    bump();
    const events: (keyof WindowEventMap)[] = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, bump, { passive: true }));
    const timer = window.setInterval(async () => {
      let last = Date.now();
      try {
        last = Number(localStorage.getItem(KEY) || Date.now());
      } catch {
        /* ignore */
      }
      if (Date.now() - last < INACTIVITY_MS) return;
      const me = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" }).then((r) => r.json().catch(() => null));
      if (!me?.user) return;
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login?idle=1";
    }, 15_000);
    return () => {
      events.forEach((event) => window.removeEventListener(event, bump));
      window.clearInterval(timer);
    };
  }, []);
  return null;
}
