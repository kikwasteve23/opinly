import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "How Opinly works",
  description: "Join free. Take short studies in your browser. Pay is shown before you start. Get paid for an honest take.",
};

const steps = [
  {
    n: "1",
    title: "Join free",
    body: "Create an account in a minute. No card. Nobody will ask you to pay just to get started.",
  },
  {
    n: "2",
    title: "Tell us about you",
    body: "A short profile and a quick English check. That is how we put the right studies in front of you — the ones you actually qualify for.",
  },
  {
    n: "3",
    title: "Take studies you like",
    body: "Surveys, polls, and quick tasks on your phone or computer. You see the reward and the time before you tap start. Skip anything that is not a fit.",
  },
  {
    n: "4",
    title: "Get paid for real",
    body: "Approved answers go to your wallet as real rewards — not points, not gift cards. Researchers see what you said, never your name.",
  },
];

export default async function HowItWorksPage() {
  const user = await getSessionUser();

  return (
    <div>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        <section className="relative overflow-hidden bg-indigo-950 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">Opinly</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] sm:text-6xl">Get paid for an honest take.</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-indigo-100">
              Researchers need real people. You already have opinions. Opinly is the simple way to share them and get paid — on your phone, in your own time.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-indigo-950 hover:bg-amber-300"
            >
              Create a free account
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-extrabold">Four steps. That is the whole idea.</h2>
          <ol className="mt-10 space-y-5">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-indigo-50 py-14 dark:bg-indigo-950/40">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold">Why people stay</h2>
            <ul className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                ["Joining is free", "We will never ask you to pay just to open an account."],
                ["You see the pay first", "Every study lists the reward before you begin."],
                ["Your name stays yours", "Researchers get your answers, not who you are."],
              ].map(([title, body]) => (
                <li key={title} className="rounded-2xl bg-white p-5 dark:bg-gray-900">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{body}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-10 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Join Opinly
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
