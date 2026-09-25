import { AuthForm } from "@/components/auth-form";
import { ensureDeviceCookie } from "@/lib/device";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  await ensureDeviceCookie();
  const { ref } = await searchParams;
  return <AuthForm mode="register" referralCode={ref ?? ""} />;
}
