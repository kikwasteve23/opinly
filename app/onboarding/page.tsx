import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { getSessionUser, publicUser } from "@/lib/session";
import { mutateStore } from "@/lib/store";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.onboardingStep === "identity") {
    await mutateStore((data) => {
      const current = data.users.find((u) => u.id === user.id);
      if (current && current.onboardingStep === "identity") current.onboardingStep = "complete";
    });
    redirect("/app");
  }
  if (user.onboardingStep === "complete") redirect("/app");
  return <OnboardingFlow user={publicUser(user)} />;
}
