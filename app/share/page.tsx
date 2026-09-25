import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyCaption } from "@/components/copy-caption";
import { getSessionUser } from "@/lib/session";
import { publicOrigin } from "@/lib/app-url";
import { SOCIAL_ASSETS, socialCaptions } from "@/lib/social-copy";

export const metadata: Metadata = {
  title: "Opinly social kit",
  description: "Ready-to-post images and captions that explain how Opinly works.",
};

export default async function ShareKitPage() {
  const user = await getSessionUser();
  const origin = await publicOrigin();
  const joinUrl = `${origin}/register`;
  const explainerUrl = `${origin}/how-it-works`;
  const captions = socialCaptions(joinUrl);

  return (
    <div>
      <SiteHeader signedIn={Boolean(user)} />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">For social</p>
        <h1 className="mt-2 text-3xl font-extrabold">Explain Opinly in one post</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Download an image, copy a caption, and link people to{" "}
          <Link href="/how-it-works" className="font-semibold text-indigo-700 dark:text-indigo-400">
            How it works
          </Link>{" "}
          or straight to signup. Captions already include this join link: {joinUrl}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SOCIAL_ASSETS.map((asset) => (
            <figure key={asset.file} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <Image
                src={`/share/${asset.file}`}
                alt={asset.label}
                width={asset.size === "9:16" ? 768 : asset.size === "1:1" ? 1024 : 1376}
                height={asset.size === "9:16" ? 1376 : asset.size === "1:1" ? 1024 : 768}
                className="w-full bg-indigo-950 object-cover"
              />
              <figcaption className="space-y-1 p-4 text-sm">
                <p className="font-semibold">
                  {asset.label} · {asset.size}
                </p>
                <p className="text-gray-500">{asset.use}</p>
                <a href={`/share/${asset.file}`} download className="inline-block font-semibold text-indigo-700 dark:text-indigo-400">
                  Download PNG
                </a>
              </figcaption>
            </figure>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-extrabold">Captions</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Paste as-is, or swap the join link for a personal referral URL from Referrals after you hit $400.
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {captions.map((item) => (
            <div key={item.id}>
              <h3 className="mb-2 font-semibold">{item.label}</h3>
              <CopyCaption text={`${item.caption}\n\nHow it works: ${explainerUrl}`} />
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
