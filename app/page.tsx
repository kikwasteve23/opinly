import Link from "next/link";
import { Check, Shield, Wallet, Lock, Eye, FileCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSessionUser } from "@/lib/session";
import { money } from "@/lib/utils";

const stats = [
  { label: "Verified participants", value: "186" },
  { label: "Paid to participants", value: "$2.18K" },
  { label: "Studies completed", value: "1.64K" },
  { label: "Countries represented", value: "3" },
];

const promises = [
  {
    icon: Shield,
    title: "Never pay to join",
    body: "Signing up is free and always will be. We will never ask you for a fee, a deposit, or your card details.",
  },
  {
    icon: Wallet,
    title: "Real money, not points",
    body: "Rewards are held in US dollars and withdrawn as crypto. No gift cards, no vouchers, no expiring balances.",
  },
  {
    icon: Lock,
    title: "Your ID stays private",
    body: "Verification documents are stored privately, used once to confirm who you are, and never shown to researchers.",
  },
  {
    icon: Eye,
    title: "You see the pay first",
    body: "Every study lists its reward and rough length up front. Nothing is hidden until the end.",
  },
];

const steps = [
  {
    title: "About you",
    body: "Tell us the basics: where you live, your background, the languages you speak. Researchers use this to match you to studies you actually qualify for, which means far fewer screen-outs.",
  },
  {
    title: "English assessment",
    body: "A short set of questions on grammar and comprehension, plus a brief writing sample. Studies are written in English, and this keeps the quality high for everyone.",
  },
  {
    title: "Identity check",
    body: "Confirm a government ID and a live selfie from your phone. One person, one account. This is what keeps duplicate accounts out.",
  },
  {
    title: "Start earning",
    body: "Your dashboard fills with studies you qualify for. Take the ones you like, skip the rest, and withdraw once your balance is ready.",
  },
];

const examples = [
  { title: "Shopping habits after a price rise", meta: "Survey · About 12 min", pay: 6 },
  { title: "Rate three app onboarding flows", meta: "Usability · About 18 min", pay: 9.25 },
  { title: "Quick poll: news and trust", meta: "Short poll · About 4 min", pay: 1.75 },
  { title: "Diary study: one entry a day, 5 days", meta: "Multi-day · 5 × 5 min", pay: 22 },
];

const faqs = [
  {
    q: "Is it really free to join?",
    a: "Yes. Creating an account costs nothing, and we will never ask you for a payment, a deposit, or your card details. If anyone claiming to be from Opinly asks you for money, it is not us.",
  },
  {
    q: "Why do you need my ID?",
    a: "Because one person should have one account. Without an identity check, a handful of people with dozens of accounts each would take the studies meant for everyone else, and researchers would stop trusting the results. Your documents are stored privately, seen only by our review team, and never shared with researchers.",
  },
  {
    q: "How much can I earn?",
    a: "It depends on how many studies you qualify for and how much time you put in. Individual studies typically pay a few dollars for a few minutes of work. Treat it as extra money rather than a wage and you will not be disappointed.",
  },
  {
    q: "How do I get paid?",
    a: "Your rewards build up as a balance in US dollars. When you reach the minimum, you withdraw to a USDT (TRC20) or Litecoin address that you control. You will need a crypto wallet.",
  },
  {
    q: "Why was my submission rejected?",
    a: "Usually because the answers did not follow the brief: attention checks missed, contradictory responses, or text that appears copy-pasted. If you think a rejection was wrong, contact support and a person will look at it again.",
  },
  {
    q: "Do I need a phone?",
    a: "For the identity check, yes. Studies themselves work on a computer or a phone.",
  },
  {
    q: "What happens to my data?",
    a: "Your profile is used to match you to studies. Researchers see the answers you give in their study and the demographic details their study is aimed at, but never your name, your email, or your identity documents.",
  },
  {
    q: "Can I have more than one account?",
    a: "No. Duplicate accounts are the main thing our checks look for, and accounts found this way are closed. If you have lost access to an old account, contact support rather than making a new one.",
  },
];

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <div>
      <SiteHeader signedIn={Boolean(user)} />
      <section className="relative overflow-hidden">
        <div className="op-grid absolute inset-0 -z-10" />
        <div className="absolute -top-32 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-600/15" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <p className="op-up op-up-1 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-900/25 dark:text-indigo-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              Now accepting new participants
            </p>
            <h1 className="op-up op-up-2 mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Get paid for
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-300">
                {" "}
                an honest take.
              </span>
            </h1>
            <p className="op-up op-up-3 mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Opinly pays you to take part in online research. Every study runs right here in your browser, with no redirects, no endless screen-outs, no gift cards. You see the pay and the length before you start, and the money lands in your wallet once your work is approved.
            </p>
            <div className="op-up op-up-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={user ? "/app" : "/register"}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                {user ? "Open your dashboard" : "Start earning, it's free"}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-7 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                See how it works
              </Link>
            </div>
            <ul className="op-up op-up-4 mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              {["Free to join, always", "Paid in crypto, not points", "Work whenever you like"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="op-drift rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-900/5 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Available now</p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">How do you choose a streaming service?</h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">About 9 minutes</span>
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">Multiple choice</span>
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">Desktop or phone</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">$4.50</span>
              </div>
              <div className="mt-4 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white">Start study</div>
            </div>
            <div className="op-drift-2 ml-auto mt-5 w-[85%] rounded-2xl border border-indigo-900/20 bg-gradient-to-br from-indigo-600 to-violet-800 p-5 text-white shadow-xl">
              <p className="text-sm font-medium text-indigo-100">Wallet balance</p>
              <p className="mt-1 text-3xl font-bold">$62.75</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-white/10 px-3 py-2">
                  <p className="text-indigo-100">Pending review</p>
                  <p className="font-semibold">$8.25</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2">
                  <p className="text-indigo-100">Withdrawn</p>
                  <p className="font-semibold">$140.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {promises.map((item) => (
            <div key={item.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="text-3xl font-extrabold tracking-tight">Four steps, then you&apos;re earning</h2>
        <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Getting set up takes most people under half an hour. We front-load the checks so that once you&apos;re in, studies are simply there waiting for you.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/25">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-900/15">
          <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">
            One thing to expect: identity documents are reviewed manually. During busy periods that can take up to five working days. You can look around the platform while you wait, but you can&apos;t start a study until the check clears. On this demo, the check is approved as soon as you submit it so you can try the full flow.
          </p>
        </div>
      </section>

      <section id="studies" className="scroll-mt-24 border-y border-gray-200 bg-gray-50 py-20 dark:border-gray-800 dark:bg-gray-900/50 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Work worth showing up for</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Researchers bring real questions: how people shop, what they trust, how they use the apps on their phone. Your answers shape products, papers and policy. Pick the studies that interest you, give them your honest attention, and get paid for every one that&apos;s approved.
            </p>
            <ul className="mt-8 space-y-5 text-sm text-gray-700 dark:text-gray-300">
              {[
                ["Your answers save as you go", "Close the tab, lose your connection, come back tomorrow, and your progress is still there."],
                ["Only studies you qualify for", "Matching happens before you see the study, not after you have spent ten minutes on it."],
                ["Attention checks, both ways", "Some studies include simple checks. They keep results honest, which keeps researchers paying fairly."],
                ["Reviewed, then paid", "Completed work goes to review. Once approved, the reward moves from pending into your balance."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 space-y-3 lg:mt-0">
            {examples.map((study) => (
              <div key={study.title} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex-1">
                  <p className="font-semibold">{study.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{study.meta}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {money(study.pay)}
                </span>
              </div>
            ))}
            <p className="pt-2 text-sm text-gray-500">Examples of the kinds of studies researchers run. What you see depends on your profile.</p>
          </div>
        </div>
      </section>

      <section id="payouts" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="text-3xl font-extrabold tracking-tight">Your balance, your call</h2>
        <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          Rewards are held in US dollars. When you&apos;re ready, withdraw to a crypto address you control. Two costs come off the amount you request: the blockchain&apos;s own network fee, and a 5% platform fee. Both are shown before you confirm, so you always know what will arrive.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">USDT (TRC20)</h3>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Available</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Minimum</dt>
                <dd className="font-semibold">$10.00</dd>
              </div>
              <div>
                <dt className="text-gray-500">Network fee</dt>
                <dd className="font-semibold">$1.00</dd>
              </div>
              <div>
                <dt className="text-gray-500">Platform fee</dt>
                <dd className="font-semibold">5%</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-gray-500">Tron network USDT address. Do not use an ERC20 or BEP20 address.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Litecoin (LTC)</h3>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Available</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Minimum</dt>
                <dd className="font-semibold">$10.00</dd>
              </div>
              <div>
                <dt className="text-gray-500">Network fee</dt>
                <dd className="font-semibold">$0.10</dd>
              </div>
              <div>
                <dt className="text-gray-500">Platform fee</dt>
                <dd className="font-semibold">5%</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-gray-500">Litecoin mainnet address.</p>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="font-semibold">A couple of house rules</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {[
              "One withdrawal every 72 hours, so let your balance build up before cashing out.",
              "Both fees come out of the amount you request, so the figure you confirm is the figure that arrives.",
              "Double-check the address and the network. Crypto sent to the wrong chain cannot be recovered.",
              "Rewards for completed studies move into your balance once a reviewer approves the work.",
            ].map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-20 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">What this is, and what it isn&apos;t</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Opinly is a way to earn extra money in the gaps of your week. It is not a full-time income, and anyone promising you that is not being straight with you.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-0">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="font-semibold text-indigo-700 dark:text-indigo-300">You can expect</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>· Studies that fit around your own schedule</li>
                <li>· Clear pay shown before you commit</li>
                <li>· Payment for work that meets the brief</li>
                <li>· A real person reviewing disputed submissions</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="font-semibold">Please don&apos;t expect</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>· A steady stream of studies every single day</li>
                <li>· A replacement for a salary</li>
                <li>· Payment for rushed or copy-pasted answers</li>
                <li>· More than one account per person</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight">Questions, answered plainly</h2>
        <div className="mt-10 divide-y divide-gray-200 dark:divide-gray-800">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-semibold">{item.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-indigo-600 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Your opinion is worth something.</h2>
            <p className="mt-3 max-w-2xl text-indigo-100">Create your account, work through the checks once, and start picking up studies that fit your week.</p>
          </div>
          <Link href={user ? "/app" : "/register"} className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700">
            {user ? "Go to dashboard" : "Create a free account"}
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
