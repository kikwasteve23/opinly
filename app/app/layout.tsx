import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/session";

export default async function LoggedInLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.onboardingStep !== "complete") redirect("/onboarding");
  return <AppShell email={user.email}>{children}</AppShell>;
}
