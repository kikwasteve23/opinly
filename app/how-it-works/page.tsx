import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSessionUser } from "@/lib/session";
import { ACTIVATION_DEPOSIT, MIN_WITHDRAWAL } from "@/lib/money";
import { BRONZE_REFERRALS } from "@/lib/referrals";
import { publicOrigin } from "@/lib/app-url";

export const metadata: Metadata = {
  title: "How Opinly works",
  description:
    "Opinly is paid online research. Join free, take short studies in your browser with pay shown up front, and withdraw real USD as crypto from $500.",
  openGraph: {
    title: "How Opinly works — get paid for an honest take",
    description: "Free to join. Studies in your browser. Pay shown first. Real USD, withdrawn as crypto.",
    images: [{ url: "/share/opinly-ad-landscape.png", width: 1376, height: 768 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Opinly works",
    description: "Get paid for an honest take. Free to join. Real money, not points.",
    images: ["/share/opinly-ad-landscape.png"],
  },
};

const steps = [
  {
    n: "01",
    title: "Create a free account",
    body: "Email, password, and your country. We never charge a fee just to join, and we will never ask for a card to start studies.",
  },
  {
    n: "02",
    title: "Tell us about you",
    body: "A short profile and an English check. That is how we match you to studies you actually qualify for, so you spend less time screening out.",
  },
  {
    n: "03",
    title: "Take studies that match",
    body: "Surveys, quick polls, and usability tasks run in the browser — phone or computer. Reward and length are listed before you tap start.",
  },
  {
    n: "04",
    title: "Get paid in real USD",
    body: "Approved work moves from pending to your wallet. It is dollars, not points. Local currency is shown next to USD so the amount feels real.",
  },
  {
    n: "05",
    title: "Withdraw in crypto",
    body: `Cash-out opens from $${MIN_WITHDRAWAL} available, to a wallet you control (USDT TRC20 or Litecoin). You always see the fees before you confirm.`,
  },
];

export default async function HowItWorksPage() {
  const user = await getSessionUser();
  const origin = await publicOrigin();
  const join = `${origin}/register`;
  const share = `${origin}/how-it-works`;

  return (
    <div>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        <section className="relative overflow-hidden bg-indigo-950 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Opinly</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Get paid for an honest take.</h1>
            <p className="mt-5 max-w-2xl text-lg text-indigo-100">
              Opinly is paid online research. You share opinions with researchers. They pay you in real money. Joining is
              free. Pay is shown before you start.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-indigo-950 hover:bg-amber-300">
                Join free
              </Link>
              <Link href="/share" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Social post kit
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold">How it works</h2>
          <ol className="mt-8 space-y-6">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-sm font-bold text-indigo-600">{step.n}</span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-gray-50 py-14 dark:bg-gray-900/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold">The honest small print</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <li>Beginner studies are open from day one. After about $400 earned, you move to Bronze and bring {BRONZE_REFERRALS} active referrals to unlock that list.</li>
              <li>
                Withdrawals start at ${MIN_WITHDRAWAL}. A ${ACTIVATION_DEPOSIT} wallet activation is credited to your balance — it is not a fee we keep.
              </li>
              <li>Researchers see your answers, not your name, email, or ID.</li>
              <li>One account per person. If you lose your password, use the emergency recovery codes you saved at signup.</li>
            </ul>
            <p className="mt-8 text-sm text-gray-500">
              Share this page:{" "}
              <a href={share} className="font-medium text-indigo-700 underline dark:text-indigo-400">
                {share}
              </a>
              . Direct join link:{" "}
              <a href={join} className="font-medium text-indigo-700 underline dark:text-indigo-400">
                {join}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
