import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";
import { getSessionUser } from "@/lib/session";
import { Logo } from "@/components/logo";

export default async function StaffAccessPage() {
  const user = await getSessionUser();
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <Logo />
      <h1 className="mt-8 text-2xl font-extrabold">Staff only</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        You are signed in as <strong>{user?.email ?? "a participant"}</strong>. The admin desk is a different account. Log
        out, then sign in with <code>admin@opinly.local</code> and the <code>DEMO_ADMIN_PASSWORD</code> from Render.
      </p>
      <div className="mt-6 flex gap-3">
        <form action={logoutAction}>
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Log out</button>
        </form>
        <Link href="/login?staff=1" className="rounded-xl border px-4 py-2 text-sm font-semibold">
          Staff login
        </Link>
      </div>
    </div>
  );
}
