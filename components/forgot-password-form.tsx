"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { resetPasswordAction, type AuthState } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction, null);
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <form action={action} className="my-auto space-y-4 py-10">
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use one unused emergency recovery code. Each code works once. After you log in you can issue a fresh set from
          Profile.
        </p>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:bg-gray-950" />
        </label>
        <label className="block text-sm font-medium">
          Recovery code
          <input
            name="recoveryCode"
            required
            autoComplete="one-time-code"
            placeholder="XXXX-XXXX"
            className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-mono uppercase dark:bg-gray-950"
          />
        </label>
        <label className="block text-sm font-medium">
          New password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:bg-gray-950" />
        </label>
        <label className="block text-sm font-medium">
          Confirm new password
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 dark:bg-gray-950" />
        </label>
        {state?.error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p role="status" className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
            {state.ok}{" "}
            <Link href="/login" className="font-semibold underline">
              Log in
            </Link>
          </p>
        ) : null}
        <button disabled={pending} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">
          {pending ? "Updating…" : "Update password"}
        </button>
        <p className="text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-indigo-700">
            Back to log in
          </Link>
        </p>
      </form>
    </div>
  );
}
