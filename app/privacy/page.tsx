import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold text-indigo-600">Privacy Policy · Opinly</p>
        <h1 className="mt-2 text-4xl font-extrabold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated 21 September 2026</p>
        <p className="mt-6 leading-relaxed text-gray-700 dark:text-gray-300">
          We collect what we need to match you to studies, confirm you are one real person, and pay you. We do not sell your data, we run no advertising or analytics trackers, and researchers see your answers without your name attached.
        </p>
        <div className="prose-custom mt-10 space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. What we hold</h2>
          <p>Account details: name, email, and a hashed password. Your participant profile: demographics used for matching. Identity verification images and metadata, with ID numbers stored only as a one-way hash. Technical connection information used to detect duplicate accounts. Study activity and payout records. We never hold bank or card details.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Why we hold it</h2>
          <p>To run your account, match studies, prevent fraud, deliver research, and pay you. Identity verification is based on your consent. You can withdraw that consent; doing so means we can no longer verify you, which is a condition of withdrawing earnings.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. What researchers see</h2>
          <p>Researchers receive your answers and the demographic characteristics a study screened on. They do not receive your name, email, identity documents, or payout address.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Cookies</h2>
          <p>We use cookies only to keep you signed in. There is no advertising network and no analytics tracker on this site.</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Your rights</h2>
          <p>
            Ask us to show, correct, or delete what we hold. Email{" "}
            <a className="text-indigo-700" href="mailto:support@opinly.example">
              support@opinly.example
            </a>
            . Some payment records may be kept where the law requires it.
          </p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Children</h2>
          <p>Opinly is for adults. You must be at least 18.</p>
          <p>
            Full legal terms live on the <Link href="/terms">Terms of Service</Link>.
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
