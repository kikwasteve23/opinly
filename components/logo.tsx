import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold", className)} aria-label="Opinly home">
      <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
      {wordmark ? (
        <span className="text-xl tracking-tight text-gray-900 dark:text-white">
          Opin<span className="text-indigo-500 dark:text-indigo-400">ly</span>
        </span>
      ) : null}
    </Link>
  );
}
