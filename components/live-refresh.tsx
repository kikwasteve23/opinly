"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Pulls server-rendered threads so deposit chat stays live for both sides. */
export function LiveRefresh({ ms = 3500 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), ms);
    return () => window.clearInterval(id);
  }, [router, ms]);
  return null;
}
