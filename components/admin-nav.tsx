"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applicants", label: "Applicants" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/surveys", label: "Surveys" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/support", label: "Deposit chat" },
  { href: "/admin/withdrawals", label: "Withdrawals" },
  { href: "/admin/reviews", label: "Study reviews" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ waitingChats = 0 }: { waitingChats?: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const badge = link.href === "/admin/support" && waitingChats > 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-medium",
              active
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 dark:text-gray-200 dark:hover:bg-indigo-950",
            )}
          >
            <span className="flex items-center justify-between gap-2">
              {link.label}
              {badge ? (
                <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white text-indigo-700" : "bg-amber-100 text-amber-900"}`}>
                  {waitingChats}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
