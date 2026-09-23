import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold text-indigo-600">Terms of Service · Opinly</p>
        <h1 className="mt-2 text-4xl font-extrabold">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated 21 September 2026</p>
        <p className="mt-6 leading-relaxed text-gray-700 dark:text-gray-300">
          In short: you must be 18 or over, you may hold one account, you answer studies honestly, and we pay you what a study says it pays once your submission is approved.
        </p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. What Opinly is</h2>
          <p>Opinly is a marketplace. Researchers publish studies and set what each one pays; participants take those studies and are paid for completed, approved submissions. We are not your employer. Opinly is not a job and not a guaranteed income.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Who can join</h2>
          <p>You must be at least 18, live in a country we are recruiting from, give true information, and hold one account only.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Taking studies</h2>
          <p>Each study shows pay and length before you start. Answer honestly, in your own words. Studies may include attention checks. Do not share study content.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Getting paid</h2>
          <p>Payout methods are USDT (TRC20), Litecoin, and country-local rails for the $50 wallet activation (credited to your available balance, not taken as a fee). Minimum withdrawal $500. You must be on referral level 2 (20 active referrals: approved people who finished a survey). Platform fee 5%. Network fees are passed through at cost. One withdrawal every 72 hours. After changing a payout address, withdrawals pause for 24 hours. Completed submissions stay in pending while we review your responses. Activation deposits and marketer payments wait for an admin to match the transfer. Crypto sent to an address you supplied cannot be reversed.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. What ends an account</h2>
          <p>Duplicate accounts, VPNs used to misrepresent location, bots, selling accounts, or false identity information can lead to suspension. Legitimately earned funds remain yours.</p>
          <p>
            Questions:{" "}
            <a className="text-indigo-700" href="mailto:support@opinly.example">
              support@opinly.example
            </a>
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
