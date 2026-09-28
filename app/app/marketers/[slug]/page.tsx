import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HireCheckout } from "@/components/hire-checkout";
import { requireCompleteUser } from "@/lib/auth-actions";
import { findMarketer } from "@/lib/marketers";
import { hitWalletCap } from "@/lib/referrals";
import { money } from "@/lib/utils";

export default async function MarketerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireCompleteUser();
  if (!hitWalletCap(user)) redirect("/app");
  const { slug } = await params;
  const marketer = findMarketer(slug);
  if (!marketer) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/marketers" className="text-sm font-semibold text-indigo-700">
        ← All marketers
      </Link>
      <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={marketer.photo} alt="" className="h-28 w-28 rounded-2xl object-cover" />
          <div>
            <h1 className="text-2xl font-extrabold">{marketer.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{marketer.region}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{marketer.bio}</p>
            <p className="mt-3 text-sm">
              {money(marketer.priceEach)} per referral · typically {marketer.hours} · {marketer.minOrder}–{marketer.maxOrder} per order
            </p>
          </div>
        </div>
        <div className="grid gap-4 border-t border-gray-100 px-6 py-5 sm:grid-cols-2 dark:border-gray-800">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Languages</h2>
            <p className="mt-1 text-sm">{marketer.languages.join(", ")}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Specialties</h2>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {marketer.specialties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Hire {marketer.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pay before or pay after both thank you first, then take you to deposit for the calculated total.
        </p>
        <HireCheckout marketer={marketer} compact />
      </div>
    </div>
  );
}
