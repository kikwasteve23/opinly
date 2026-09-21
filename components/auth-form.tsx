"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginAction, registerAction, type AuthState } from "@/lib/auth-actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-indigo-700 p-10 text-white lg:flex lg:flex-col">
        <Logo className="text-white [&_span]:text-white" />
        <div className="mt-auto max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">Get paid for your opinions.</h1>
          <p className="mt-4 text-indigo-100">
            Join a verified community of people earning real money by taking part in research studies.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li>
              <p className="font-semibold">Fast crypto payouts</p>
              <p className="text-indigo-100">Withdraw your earnings in USDT or Litecoin.</p>
            </li>
            <li>
              <p className="font-semibold">Verified, fair community</p>
              <p className="text-indigo-100">Real people, screened for quality, with no bots.</p>
            </li>
            <li>
              <p className="font-semibold">Studies from around the world</p>
              <p className="text-indigo-100">Get matched to studies that fit your profile.</p>
            </li>
          </ul>
          <dl className="mt-10 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-indigo-100">Minimum cashout</dt>
              <dd className="text-lg font-bold">$10</dd>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-indigo-100">Every member</dt>
              <dd className="text-lg font-bold">ID-verified</dd>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-indigo-100">Payout processing</dt>
              <dd className="text-lg font-bold">24h</dd>
            </div>
          </dl>
          {mode === "register" ? (
            <p className="mt-8 text-sm text-indigo-100">
              We are currently welcoming participants in the United States, United Kingdom, Canada, Ireland, and Australia. More countries open as new studies arrive.
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ms-auto">
            <ThemeToggle />
          </div>
        </div>
        <form action={formAction} className="mx-auto my-auto w-full max-w-md py-10">
          <h2 className="text-2xl font-extrabold">{mode === "login" ? "Log in to Opinly" : "Create your Opinly account"}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {mode === "login" ? "Welcome back. Pick up where you left off." : "Free to join. No card, no deposit."}
          </p>
          <label className="mt-8 block text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={mode === "login" ? "demo@opinly.local" : ""}
              className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              defaultValue={mode === "login" ? "demo-dev-only" : ""}
              className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          {mode === "register" ? (
            <label className="mt-4 block text-sm font-medium">
              Country
              <select
                name="country"
                defaultValue="United States"
                className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
              >
                {["United States", "United Kingdom", "Canada", "Ireland", "Australia"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-3 text-xs text-gray-500">Demo details are filled in so you can look around immediately.</p>
          )}
          {state?.error ? (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {mode === "login" ? (
              <>
                New here?{" "}
                <Link href="/register" className="font-semibold text-indigo-700 dark:text-indigo-400">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-indigo-700 dark:text-indigo-400">
                  Log in
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
