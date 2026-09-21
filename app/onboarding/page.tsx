import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { getSessionUser, publicUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.onboardingStep === "complete") redirect("/app");
  return <OnboardingFlow user={publicUser(user)} />;
}
