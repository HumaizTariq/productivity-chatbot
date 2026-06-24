import { AuthForm } from "@/components/auth-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AuthForm mode="register" />
    </div>
  )
}
