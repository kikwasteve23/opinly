import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/session";
import { MIN_WITHDRAWAL } from "@/lib/money";
import { resolveCountry } from "@/lib/resolve-geo";

export default async function LoggedInLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.onboardingStep !== "complete") redirect("/onboarding");
  const country = await resolveCountry(user);
  return (
    <AppShell email={user.email} showDeposit={user.available >= MIN_WITHDRAWAL} locationLabel={`${country.name} · ${country.currency}`}>
      {children}
    </AppShell>
  );
}
