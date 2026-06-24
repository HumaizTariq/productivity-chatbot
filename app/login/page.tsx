import { AuthForm } from "@/components/auth-form"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {params.registered && (
        <div className="mb-6 bg-[#7a9a5a]/10 text-[#7a9a5a] border border-[#7a9a5a]/20 rounded-xl px-4 py-3 text-sm max-w-sm w-full text-center">
          Account created! Sign in to continue.
        </div>
      )}
      <AuthForm mode="login" />
    </div>
  )
}
