import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ staff?: string; idle?: string }> }) {
  const { staff, idle } = await searchParams;
  return (
    <div>
      {idle === "1" ? (
        <p className="bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">You were signed out after a period of inactivity.</p>
      ) : null}
      <AuthForm mode="login" staff={staff === "1"} />
    </div>
  );
}
