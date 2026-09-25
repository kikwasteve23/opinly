"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { OPEN_COUNTRIES } from "@/lib/onboarding-data";
import { loginAction, registerAction, type AuthState } from "@/lib/auth-actions";
import { DeviceTokenField } from "@/components/device-token";
import { RecoveryCodesPanel } from "@/components/recovery-codes-panel";

export function AuthForm({
  mode,
  referralCode = "",
  staff = false,
}: {
  mode: "login" | "register";
  referralCode?: string;
  staff?: boolean;
}) {
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
        {state?.codes?.length ? (
          <div className="mx-auto my-auto w-full max-w-md py-10">
            <RecoveryCodesPanel codes={state.codes} />
          </div>
        ) : (
          <form action={formAction} className="mx-auto my-auto w-full max-w-md py-10">
            <h2 className="text-2xl font-extrabold">
              {mode === "register" ? "Create your Opinly account" : staff ? "Staff login" : "Log in to Opinly"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {mode === "register"
                ? "Free to join. No card, no deposit. You will get emergency recovery codes to copy and save."
                : staff
                  ? "This is the operations desk. After login you land on /admin."
                  : "Welcome back. Pick up where you left off."}
            </p>
            <DeviceTokenField />
            <label className="mt-8 block text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={mode === "login" ? (staff ? "admin@opinly.local" : "demo@opinly.local") : ""}
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
                defaultValue={mode === "login" ? (staff ? "" : "demo-dev-only") : ""}
                className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
              />
            </label>
            {mode === "register" ? (
              <>
                <label className="mt-4 block text-sm font-medium">
                  Country
                  <select
                    name="country"
                    defaultValue="United States"
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
                  >
                    {OPEN_COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block text-sm font-medium">
                  Referral code
                  <input
                    name="referralCode"
                    defaultValue={referralCode}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 uppercase dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Optional"
                  />
                </label>
              </>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                {staff ? (
                  <>
                    Default staff email is <code>admin@opinly.local</code>.{" "}
                    <Link href="/login" className="font-semibold text-indigo-700">
                      Participant login
                    </Link>
                  </>
                ) : (
                  <>
                    Lost your password?{" "}
                    <Link href="/forgot-password" className="font-semibold text-indigo-700">
                      Reset with a recovery code
                    </Link>
                  </>
                )}
              </p>
            )}
            {state?.error ? (
              <p
                role="alert"
                className={
                  state.error.includes("three accounts")
                    ? "mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                    : "mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
                }
              >
                {state.error}
              </p>
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
        )}
      </div>
    </div>
  );
}
