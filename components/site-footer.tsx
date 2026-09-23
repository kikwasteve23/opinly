import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Opinly connects researchers with people willing to share an honest opinion, and makes sure those people actually get paid for it.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Platform</p>
            <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/#how" className="hover:text-indigo-700 dark:hover:text-indigo-400">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-700 dark:hover:text-indigo-400">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-700 dark:hover:text-indigo-400">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Legal</p>
            <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-indigo-700 dark:hover:text-indigo-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-700 dark:hover:text-indigo-400">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
              <li>418 Market Street, Suite 210</li>
              <li>Portland, OR 97201</li>
              <li>
                <a href="mailto:support@opinly.example" className="hover:text-indigo-700 dark:hover:text-indigo-400">
                  support@opinly.example
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
