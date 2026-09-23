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
  { href: "/admin/withdrawals", label: "Withdrawals" },
  { href: "/admin/reviews", label: "Study reviews" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
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
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
