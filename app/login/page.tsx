import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ staff?: string }> }) {
  const { staff } = await searchParams;
  return <AuthForm mode="login" staff={staff === "1"} />;
}
